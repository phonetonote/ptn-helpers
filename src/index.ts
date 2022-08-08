const FEED_LINK_KEYS = [
  "title",
  "_ptr_open_graph_description",
  "_ptr_open_graph_site_name",
  "_ptr_open_graph_type",
] as const;

type FeedLinkKey = typeof FEED_LINK_KEYS[number];

type FeedAttachment = {
  [feedLinkKey in FeedLinkKey]: string;
} & {
  _ptr_media_type: string;
  _ptr_open_graph_image_url?: string;
  url?: string;
};

export type FeedItem = {
  id: string;
  date_published: string;
  url: string;
  content_text: string;
  attachments?: FeedAttachment[];
  _ptr_sender_type: string;
};

export type PtnNode = {
  text: string;
  children: PtnNode[];
  uid?: string;
};

export const itemToNode = (feedItem: FeedItem, hashtag: string): PtnNode => {
  const children: PtnNode[] = [];
  let text = feedItem?.content_text ?? "";

  if ((feedItem?.attachments?.length ?? 0) > 1 && feedItem?.attachments?.[0]._ptr_media_type === "text") {
    feedItem?.attachments?.forEach((element) => {
      children.push({
        text: element.title,
        children: [],
      });
    });
  } else {
    const attachment = feedItem?.attachments?.[0];

    if (attachment?._ptr_media_type === "link") {
      if (attachment?._ptr_open_graph_image_url?.length ?? 0 > 0) {
        children.push({
          text: `![](${attachment["_ptr_open_graph_image_url"]})`,
          children: [],
        });
      }

      FEED_LINK_KEYS.forEach((k: FeedLinkKey) => {
        const v = attachment[k];
        if (v?.length > 0) {
          children.push({
            text: `${k.replace("_ptr_", "").replace(/_/g, " ")}:: ${v.trim()}`,
            children: [],
          });
        }
      });
    } else if (attachment?._ptr_media_type === "text") {
      if (attachment?.title?.length ?? 0 > 0) {
        children.push({
          text: `${attachment.title}`,
          children: [],
        });
      }
    } else if (attachment?._ptr_media_type === "image") {
      text = `![](${attachment.url})`;

      // this is captions
      if (attachment?.title?.length ?? 0 > 0) {
        children.push({
          text: `${attachment.title}`,
          children: [],
        });
      }
    } else if (attachment?._ptr_media_type === "audio") {
      const title = feedItem.content_text?.trim()?.length > 0 ? feedItem.content_text : "Audio Recording";
      text = `[${title}](${attachment.url})`;
    }
  }

  text = `${text.trim()}`;
  const validHashtag = hashtag && typeof hashtag === "string" && hashtag.length > 0;
  const existingTags = /#\w+to(roam|note)/;
  const needsNewTag = !!!text.match(existingTags)?.length;

  if (validHashtag && needsNewTag) {
    text = `${text} #${hashtag}`;
  }

  return {
    text: `${text}`,
    children: children,
    uid: feedItem.id,
  };
};

import { format } from "date-fns";

export const organizeFeedItems = (
  feedItems: FeedItem[],
  dateFormat: string = "MMMM do, yyyy"
): Record<string, Record<string, FeedItem[]>> => {
  const reduceFeedItems = (obj: Record<string, Record<string, FeedItem[]>>, feedItem: FeedItem) => {
    const date = new Date(feedItem.date_published),
      pageName = format(date, dateFormat),
      senderType = feedItem._ptr_sender_type;

    if (!obj.hasOwnProperty(pageName)) {
      obj[pageName] = {};
    }

    if (!obj[pageName][senderType]) {
      obj[pageName][senderType] = [];
    }

    obj[pageName][senderType].push(feedItem);
    return obj;
  };

  return feedItems.reduce(reduceFeedItems, {});
};
