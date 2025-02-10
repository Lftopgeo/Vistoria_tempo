export const PDF_STYLES = {
  colors: {
    primary: "#1a1a1a",
    secondary: "#666666",
    success: "#4CAF50",
    warning: "#FFA726",
    danger: "#F44336",
    background: "#FFFFFF",
    lightGray: "#F5F5F5",
    border: "#E0E0E0",
  },
  fonts: {
    normal: "helvetica",
    bold: "helvetica-bold",
  },
  fontSize: {
    title: 16,
    subtitle: 14,
    normal: 10,
    small: 8,
  },
  spacing: {
    padding: 15,
    margin: 20,
  },
  table: {
    headerStyles: {
      fillColor: [250, 250, 250],
      textColor: [26, 26, 26],
      fontSize: 12,
      fontStyle: "bold",
      cellPadding: 8,
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 6,
      textColor: [51, 51, 51],
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    conditionColors: {
      bom: [232, 245, 233], // Light green
      ruim: [255, 243, 224], // Light orange
      pessimo: [255, 235, 238], // Light red
    },
  },
};

export const getConditionStyle = (condition: string) => {
  switch (condition.toLowerCase()) {
    case "bom":
      return {
        textColor: [27, 94, 32], // Dark green
        fillColor: [232, 245, 233], // Light green
      };
    case "ruim":
      return {
        textColor: [230, 81, 0], // Dark orange
        fillColor: [255, 243, 224], // Light orange
      };
    case "pessimo":
      return {
        textColor: [198, 40, 40], // Dark red
        fillColor: [255, 235, 238], // Light red
      };
    default:
      return {
        textColor: [51, 51, 51], // Dark gray
        fillColor: [250, 250, 250], // Light gray
      };
  }
};
