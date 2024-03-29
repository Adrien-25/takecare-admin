import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { withSwal } from "react-sweetalert2";

// Categories component
function Categories({ swal }) {
  // State variables to store category data and form inputs
  const [editedCategory, setEditedCategory] = useState(null);
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [properties, setProperties] = useState([]);

  // useEffect hook to fetch categories data from the API when the component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Function to fetch categories data from the API
  function fetchCategories() {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }

  // Function to handle the form submission and save/update a category
  async function saveCategory(ev) {
    ev.preventDefault();
    const data = {
      name,
      parentCategory,
      properties: properties.map((p) => ({
        name: p.name,
        values: p.values.split(","),
      })),
    };
    if (editedCategory) {
      data._id = editedCategory._id;
      await axios.put("/api/categories", data);
      setEditedCategory(null);
    } else {
      await axios.post("/api/categories", data);
    }
    setName("");
    setParentCategory("");
    setProperties([]);
    fetchCategories();
  }

  // Function to edit a category
  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);
    setProperties(
      category.properties.map(({ name, values }) => ({
        name,
        values: values.join(","),
      }))
    );
  }

  // Function to delete a category
  function deleteCategory(category) {
    swal
      .fire({
        title: "Êtes-vous sûr?",
        text: `Voulez-vous supprimer ${category.name}?`,
        showCancelButton: true,
        cancelButtonText: "Annuler",
        confirmButtonText: "Oui, Supprimer!",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const { _id } = category;
          await axios.delete("/api/categories?_id=" + _id);
          fetchCategories();
        }
      });
  }

  // Function to add a new property input field
  function addProperty() {
    setProperties((prev) => {
      return [...prev, { name: "", values: "" }];
    });
  }

  // Function to handle changes in the property name input
  function handlePropertyNameChange(index, property, newName) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }

  // Function to handle changes in the property values input
  function handlePropertyValuesChange(index, property, newValues) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }

  // Function to remove a property input field
  function removeProperty(indexToRemove) {
    setProperties((prev) => {
      return [...prev].filter((p, pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  }

  // Return the JSX elements inside the 'Layout' component
  return (
    <Layout>
      <h1>Categories</h1>
      <label>
        {editedCategory
          ? `Modifier catégorie ${editedCategory.name}`
          : "Créer une nouvelle catégorie"}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder={"Nom de la catégorie"}
            onChange={(ev) => setName(ev.target.value)}
            value={name}
          />
          <select
            onChange={(ev) => setParentCategory(ev.target.value)}
            value={parentCategory}
          >
            <option value="">Pas de catégorie parent</option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block">Propriétés</label>
          <button
            onClick={addProperty}
            type="button"
            className="btn-default text-sm mb-2"
          >
            Ajouter une nouvelle propriété
          </button>
          {properties.length > 0 &&
            properties.map((property, index) => (
              <div key={property.name} className="flex gap-1 mb-2">
                <input
                  type="text"
                  value={property.name}
                  className="mb-0"
                  onChange={(ev) =>
                    handlePropertyNameChange(index, property, ev.target.value)
                  }
                  placeholder="Nom de la propriété (exemple: couleur)"
                />
                <input
                  type="text"
                  className="mb-0"
                  onChange={(ev) =>
                    handlePropertyValuesChange(index, property, ev.target.value)
                  }
                  value={property.values}
                  placeholder="valeurs séparées par des virgules"
                />
                <button
                  onClick={() => removeProperty(index)}
                  type="button"
                  className="btn-red"
                >
                  Supprimer
                </button>
              </div>
            ))}
        </div>
        <div className="flex gap-1">
          {editedCategory && (
            <button
              type="button"
              onClick={() => {
                setEditedCategory(null);
                setName("");
                setParentCategory("");
                setProperties([]);
              }}
              className="btn-default"
            >
              Annuler
            </button>
          )}
          <button type="submit" className="btn-primary py-1">
            Sauvegarder
          </button>
        </div>
      </form>
      {!editedCategory && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Nom de la catégorie</td>
              <td>Catégorie parent</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 &&
              categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category?.parent?.name}</td>
                  <td className="flex justify-end">
                    <button
                      onClick={() => editCategory(category)}
                      className="btn-default mr-1"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteCategory(category)}
                      className="btn-red"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default withSwal(({ swal }, ref) => <Categories swal={swal} />);
