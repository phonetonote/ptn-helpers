import { itemToNode } from "../index";

const mediaUrl = "http://example.com/s3-bucket/file.jpg";
const hashtag = "phonetonote";

export const baseFeedItem = {
  id: "abc123",
  date_published: "2020-01-01T00:00:00.000Z",
  url: "http://example.com/",
  content_text: "  foo  ",
  attachments: [],
  _ptr_sender_type: "sms",
};

const baseFeedAttachment = {
  title: "foo dot com's site",
  _ptr_open_graph_description: "foos on the internet",
  _ptr_open_graph_site_name: "foo dot com",
  _ptr_open_graph_type: "article",
  _ptr_media_type: "link",
  url: "http://example.com/",
};
test("trims the text and adds the tag", () => {
  const feedItem = {
    ...baseFeedItem,
  };

  const node = itemToNode(feedItem, hashtag);
  expect(node.text).toEqual("foo #phonetonote");
  expect(node.children).toEqual([]);
});

test("inserting a nested text attachment", () => {
  const attachmentTitle = "an annotation";
  const feedItem = {
    ...baseFeedItem,
    attachments: [
      {
        ...baseFeedAttachment,
        _ptr_media_type: "text",
        title: attachmentTitle,
      },
    ],
  };

  const node = itemToNode(feedItem, hashtag);

  expect(node.children?.[0].text).toEqual(`${attachmentTitle}`);
});

test("inserting multiple text attachments", () => {
  const attachmentTitle1 = "an annotation";
  const attachmentTitle2 = "an argument";
  const feedItem = {
    ...baseFeedItem,
    attachments: [
      {
        ...baseFeedAttachment,
        _ptr_media_type: "text",
        title: attachmentTitle1,
      },
      {
        ...baseFeedAttachment,
        _ptr_media_type: "text",
        title: attachmentTitle2,
      },
    ],
  };

  const node = itemToNode(feedItem, hashtag);

  expect(node.children?.[0].text).toEqual(`${attachmentTitle1}`);
  expect(node.children?.[1].text).toEqual(`${attachmentTitle2}`);
});

test("renders image attachments in the body", () => {
  const imageCaption = "";
  const feedItem = {
    ...baseFeedItem,
    attachments: [
      {
        ...baseFeedAttachment,
        _ptr_media_type: "image",
        url: mediaUrl,
        title: imageCaption,
      },
    ],
    body: "",
    text: "",
  };

  const node = itemToNode(feedItem, hashtag);
  expect(node.text).toEqual(`![](${mediaUrl}) #phonetonote`);
  expect(node.children).toEqual([]);
});

test("renders image captions as children", () => {
  const imageCaption = "an image";
  const feedItem = {
    ...baseFeedItem,
    attachments: [
      {
        ...baseFeedAttachment,
        _ptr_media_type: "image",
        url: mediaUrl,
        title: imageCaption,
      },
    ],
    body: "",
    text: "",
  };

  const node = itemToNode(feedItem, hashtag);
  expect(node.text).toEqual(`![](${mediaUrl}) #phonetonote`);
  expect(node.children).toEqual([{ text: imageCaption, children: [] }]);
});

test("links to audio with a default link title", () => {
  const feedItem = {
    ...baseFeedItem,
    attachments: [{ ...baseFeedAttachment, _ptr_media_type: "audio", url: mediaUrl }],
    content_text: "  ",
  };

  const node = itemToNode(feedItem, hashtag);
  expect(node.text).toEqual(`[Audio Recording](${mediaUrl}) #phonetonote`);
  expect(node.children).toEqual([]);
});

test("links to documents with their title", () => {
  const attachmentTitle = "foo.txt";
  const feedItem = {
    ...baseFeedItem,
    attachments: [{ ...baseFeedAttachment, _ptr_media_type: "document", url: mediaUrl, title: attachmentTitle }],
    content_text: "  ",
  };

  const node = itemToNode(feedItem, hashtag);
  expect(node.text).toEqual(`[${attachmentTitle}](${mediaUrl}) #phonetonote`);
  expect(node.children).toEqual([]);
});

test("links to documents without a title", () => {
  const feedItem = {
    ...baseFeedItem,
    attachments: [{ ...baseFeedAttachment, _ptr_media_type: "document", url: mediaUrl, title: undefined }],
    content_text: "  ",
  };

  const node = itemToNode(feedItem, hashtag);
  expect(node.text).toEqual(`[document attachment](${mediaUrl}) #phonetonote`);
  expect(node.children).toEqual([]);
});

test("inserts link metadata as children", () => {
  const feedItem = {
    ...baseFeedItem,
    attachments: [
      {
        ...baseFeedAttachment,
        _ptr_media_type: "link",
        _ptr_open_graph_image_url: mediaUrl,
      },
    ],
  };

  const node = itemToNode(feedItem, hashtag);

  expect(node.children?.[0].text).toEqual(`![](${mediaUrl})`);
  expect(node.children?.[node.children?.length - 1].text).toEqual("open graph type:: article");
});

test("creates a node with a feed id", () => {
  const id = "new-id";
  const feedItem = {
    ...baseFeedItem,
    id,
  };

  const node = itemToNode(feedItem, hashtag);
  expect(node.uid).toEqual(`${id}`);
});
