import { organizeFeedItems } from "../index";

const baseFeedItem = {
  id: "ptn-1",
  date_published: "2020-01-01T00:00:00.000Z",
  url: "http://example.com/",
  content_text: "  foo  ",
  attachments: [],
  _ptr_sender_type: "sms",
};

test("reduces by date given a matching format", () => {
  const data = [
    { ...baseFeedItem, date_published: "2020-06-10" },
    { ...baseFeedItem, date_published: "2020-06-10" },
    { ...baseFeedItem, date_published: "2020-07-20" },
  ];

  const results = organizeFeedItems(data, "yyyy-MM-dd");
  expect(Object.keys(results).length).toEqual(2);
});
