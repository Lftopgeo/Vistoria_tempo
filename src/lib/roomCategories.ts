export const getRoomCategories = (roomType: string) => {
  const baseCategories = [
    { id: "eletrica", label: "Elétrica", items: [] },
    { id: "acabamento", label: "Acabamento", items: [] },
    { id: "mobiliario", label: "Mobiliário", items: [] },
  ];

  // Add hydraulics category only for bathroom and kitchen
  const normalizedRoomType = roomType.toLowerCase();
  if (normalizedRoomType === "banheiro" || normalizedRoomType === "cozinha") {
    return [
      baseCategories[0],
      { id: "hidraulica", label: "Hidráulica", items: [] },
      ...baseCategories.slice(1),
    ];
  }

  return baseCategories;
};
