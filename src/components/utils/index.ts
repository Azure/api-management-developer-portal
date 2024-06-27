import * as moment from "moment/moment";

export const formatDate = (date: Date) => date ? moment(date).format("MM/DD/YYYY") : "";
