export const statusOrder = [
    "No Status",
    "Request Denied",
    "Pending More Info",
    "Called and Confirmed",
    "Called and No Response",
    "Shopping List Downloaded",
    "Ready to Dispatch",
    "Received by Centre",
    "Collection Failed",
    "Parcel Collected",
    "Shipping Labels Downloaded",
    "Out for Delivery",
    "Delivered",
    "Delivery Failed",
    "Delivery Cancelled",
    "Fulfilled with Trussell Trust",
    "Request Deleted",
].map((eventName, index) => ({ eventName, workflowOrder: index }));
