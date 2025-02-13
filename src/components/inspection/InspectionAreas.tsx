import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

const inspectionAreas = [
  {
    id: "external",
    title: "Ambiente Externo",
    description: "Fachada, jardim, garagem e áreas externas",
    image:
      "https://img.freepik.com/fotos-gratis/um-retiro-de-verao-a-beira-da-piscina-rodeado-pela-natureza_1268-31055.jpg?ga=GA1.1.1139576772.1732026443&semt=ais_hybrid",
  },
  {
    id: "internal",
    title: "Ambiente Interno",
    description: "Cômodos, áreas comuns e dependências internas",
    image:
      "https://media.istockphoto.com/id/1402983488/photo/modern-white-kitchen-interior-with-furniture-kitchen-interior-with-white-wall.jpg?s=612x612&w=0&k=20&c=vgF0zwR-Gc37VwWc29nTBgn_4oHxIawVO8IO-AirUmk=",
  },
  {
    id: "keys",
    title: "Chaves",
    description: "Chaves, controles e dispositivos de acesso",
    image:
      "https://img.freepik.com/psd-premium/um-monte-de-chaves-icone-3d-chaves-modernas-realistas-para-o-novo-apartamento-casa-quarto-de-hotel-no-icone-plano-anel_743950-6355.jpg?ga=GA1.1.1139576772.1732026443&semt=ais_hybrid",
  },
  {
    id: "meters",
    title: "Medidores",
    description: "Medidores de água, luz e gás",
    image:
      "https://img.freepik.com/fotos-gratis/tanques-metalicos-cilindricos-com-manometros-na-industria-petroquimica_60438-3639.jpg?t=st=1739237827~exp=1739241427~hmac=603583b5d3bc3b2023732c636a3d21fe42d5cdd6a207571805a3d096a2d0e5ad&w=1060",
  },
];

const InspectionAreas = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-3xl w-4/5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </button>

        <div className="w-full">
          <h2 className="text-3xl md:text-4xl font-medium text-black mb-8">
            Áreas de Vistoria
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {inspectionAreas.map((area) => (
              <Card
                key={area.id}
                className="flex flex-col overflow-hidden transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-40">
                  <img
                    src={area.image}
                    alt={area.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white p-4">
                    <h3 className="text-2xl font-semibold text-center mb-2">
                      {area.title}
                    </h3>
                    <p className="text-sm text-center opacity-90">
                      {area.description}
                    </p>
                    <Button
                      onClick={() => {
                        switch (area.id) {
                          case "external":
                            navigate("/external-area");
                            break;
                          case "keys":
                            navigate("/keys-inspection");
                            break;
                          case "meters":
                            navigate("/meters-inspection");
                            break;
                          default:
                            navigate("/property-environments");
                        }
                      }}
                      className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Iniciar Vistoria
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionAreas;
