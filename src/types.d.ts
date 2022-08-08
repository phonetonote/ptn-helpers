import { FEED_LINK_KEYS } from ".";

export type FeedLinkKey = typeof FEED_LINK_KEYS[number];
export type FeedAttachment = {
  [feedLinkKey in FeedLinkKey]?: string | undefined;
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
export declare type PtnNode = {
  text: string;
  children: PtnNode[];
  uid?: string;
};
export declare const itemToNode: (feedItem: FeedItem, hashtag: string) => PtnNode;
export declare const organizeFeedItems: (
  feedItems: FeedItem[],
  dateFormat?: string
) => Record<string, Record<string, FeedItem[]>>;
export {};
