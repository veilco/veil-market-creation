export interface Market {
  uid: string;
  description: string;
  author: string;
  status: "draft" | "activating" | "activated";
  endTime: string;
}
