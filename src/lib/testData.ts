import { supabase } from "./supabase";

const mockImages = {
  quarto: [
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=500",
    "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?q=80&w=500",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=500",
  ],
  sala: [
    "https://images.unsplash.com/photo-1585128792020-803d29415281?q=80&w=500",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=500",
    "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=500",
  ],
  cozinha: [
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=500",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=500",
    "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?q=80&w=500",
  ],
  banheiro: [
    "https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=500",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=500",
    "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=500",
  ],
};

const conditions = ["bom", "ruim", "pessimo"];
const descriptions = [
  "Em perfeito estado",
  "Necessita de pequenos reparos",
  "Apresenta danos significativos",
  "Requer manutenção urgente",
  "Funcionando normalmente",
];

export const createTestInspection = async (userId: string) => {
  try {
    // 1. Create a property
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert([
        {
          title: "Apartamento Teste",
          type: "Apartamento",
          subtype: "Padrão",
          area: 120,
          value: 500000,
          registration_number: "123456",
          street: "Rua dos Testes",
          number: "100",
          complement: "Apto 1001",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
          zip_code: "01001-000",
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (propertyError) throw propertyError;

    // 2. Create an inspection
    const { data: inspection, error: inspectionError } = await supabase
      .from("inspections")
      .insert([
        {
          property_id: property.id,
          inspector_id: userId,
          inspection_date: new Date().toISOString(),
          status: "in_progress",
          observations: "Vistoria de teste automatizada",
        },
      ])
      .select()
      .single();

    if (inspectionError) throw inspectionError;

    // 3. Create rooms and their items
    for (const [roomType, images] of Object.entries(mockImages)) {
      // Create room
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .insert([
          {
            inspection_id: inspection.id,
            name: roomType,
            description: `Vistoria do ${roomType}`,
            image_url: images[0],
          },
        ])
        .select()
        .single();

      if (roomError) throw roomError;

      // Get categories for this room type
      const { data: categories } = await supabase
        .from("inspection_item_categories")
        .select("*")
        .eq("room_type", roomType);

      if (!categories) continue;

      // Create items for each category
      for (const category of categories) {
        const condition =
          conditions[Math.floor(Math.random() * conditions.length)];
        const description =
          descriptions[Math.floor(Math.random() * descriptions.length)];

        // Create item
        const { data: item, error: itemError } = await supabase
          .from("room_items")
          .insert([
            {
              room_id: room.id,
              category: category.category,
              name: category.name,
              condition,
              description,
            },
          ])
          .select()
          .single();

        if (itemError) throw itemError;

        // Add random images for the item
        const itemImages = images.slice(0, Math.floor(Math.random() * 3) + 1);
        const imagesToInsert = itemImages.map((image_url) => ({
          item_id: item.id,
          image_url,
        }));

        const { error: imagesError } = await supabase
          .from("item_images")
          .insert(imagesToInsert);

        if (imagesError) throw imagesError;
      }
    }

    return inspection.id;
  } catch (error) {
    console.error("Error creating test inspection:", error);
    throw error;
  }
};
