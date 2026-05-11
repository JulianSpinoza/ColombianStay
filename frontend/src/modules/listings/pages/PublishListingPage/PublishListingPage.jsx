import { useNavigate } from "react-router-dom";
import PropertyFormWizard from "../../components/PropertyFormWizard/PropertyFormWizard.jsx";
import { publishProperty } from "../../services/listingsService.js";

export default function PublishListing() {
  
  const navigate = useNavigate()

  const publish = async (property) => {

    const formatted = {
      title: property.title,
      description: property.description,
      propertytype: property.propertytype,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      maxguests: property.maxguests,
      pricepernight: property.pricepernight,
      locationdesc: property.locationdesc,
      addresstext: property.addresstext,
      municipality: property.city,
      images: property.photos,
      main_image_index: 0,
      // availability: property.availability,
      exactlocation: {
        lat:9.255320827572543,
        lng:-75.35241130726925,
      }
    }

    const formData = new FormData();

    Object.keys(formatted).forEach((key) => {
      if (key === 'images' && Array.isArray(formatted[key])) {
        // Si son imágenes, las agregamos una por una
        formatted[key].forEach((imageInstance) => {
          Object.keys(imageInstance).forEach((keyImage) => {
            if(keyImage === 'image') {
              formData.append('images', imageInstance[keyImage]);
            }
          })
        });
      } else if (typeof formatted[key] === 'object' && formatted[key] !== null) {
        // Para objetos complejos (como disponibilidad o amenities), los enviamos como string JSON
        formData.append(key, JSON.stringify(formatted[key]));
      } else {
        formData.append(key, formatted[key]);
      }
    });

    console.log(formatted);

    try {
      await publishProperty(formData);
    } catch (error) {
      console.log(error);
    } finally {
      // Some loading left
      navigate("/");
    }
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Wizard Component */}
      <PropertyFormWizard onPublish={publish}/>
    </div>
  );
};
