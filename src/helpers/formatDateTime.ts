export const formatDateTime = (isoString: string) => {
      const date = new Date(isoString);

      const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "short",      // "Nov"
            day: "2-digit",      // "14"
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,        // 12-hour format with AM/PM
      };

      return new Intl.DateTimeFormat("en-US", options).format(date);
};