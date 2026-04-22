import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { showErrorToast } from "../utils/toast";
import OpenStreetMap from "../Components/OpenStreetMap";
import { MapPin, Search, Heart, Stethoscope, Calendar, Users, Star } from "lucide-react";

const API = import.meta.env.VITE_API_URL; // ✅ added

const SPECIALIZATION_OPTIONS = [
  "General Physician","Cardiologist","Dermatologist","Pediatrician","Orthopedic",
  "Gynecologist","Neurologist","Psychiatrist","Dentist",
];

const SearchDoctors = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const specFromUrl = searchParams.get("spec") || "";

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specialization, setSpecialization] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    fetchSpecializations();
    if (specFromUrl) {
      setSpecialization(specFromUrl);
      fetchDoctors(specFromUrl);
    }
  }, [specFromUrl]);

  useEffect(() => {
    fetchDoctors(specialization || "");
  }, [specialization]);

  const fetchSpecializations = async () => {
    try {
      const res = await axios.get(`${API}/doctors/search`); // ✅ fixed
      const uniqueSpecs = [
        ...new Set(res.data.doctors.map((d) => d.specialization).filter(Boolean)),
      ];
      setSpecializations([...new Set([...SPECIALIZATION_OPTIONS, ...uniqueSpecs])]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async (spec = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (doctorName) params.append("name", doctorName);
      if (spec) params.append("specialization", spec);

      const res = await axios.get(`${API}/doctors/search?${params}`); // ✅ fixed
      setDoctors(res.data.doctors || []);
    } catch {
      showErrorToast("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input value={doctorName} onChange={(e)=>setDoctorName(e.target.value)} />
        <button>Search</button>
      </form>

      {loading && <p>Loading...</p>}

      {doctors.map((doc)=>(
        <div key={doc.id}>
          <p>{doc.name}</p>
          <button onClick={()=>navigate(`/book-appointment/${doc.id}`)}>Book</button>
        </div>
      ))}
    </div>
  );
};

export default SearchDoctors;
