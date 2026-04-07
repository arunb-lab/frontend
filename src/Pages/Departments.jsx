import { Link } from "react-router-dom";
import { Stethoscope, Heart, Baby, Bone, Brain, Smile } from "lucide-react";

const DEPARTMENTS = [
  { name: "General Practice", desc: "Primary care, check-ups, and common ailments", icon: Stethoscope, path: "/search-doctors?spec=General+Practice" },
  { name: "Cardiology", desc: "Heart and cardiovascular health", icon: Heart, path: "/search-doctors?spec=Cardiology" },
  { name: "Dermatology", desc: "Skin, hair, and nail conditions", icon: Smile, path: "/search-doctors?spec=Dermatology" },
  { name: "Dermatologist", desc: "Skin, hair, and nail conditions", icon: Smile, path: "/search-doctors?spec=Dermatologist" },
  { name: "Pediatrics", desc: "Children's health from birth to adolescence", icon: Baby, path: "/search-doctors?spec=Pediatrics" },
  { name: "Orthopedics", desc: "Bones, joints, and musculoskeletal care", icon: Bone, path: "/search-doctors?spec=Orthopedics" },
  { name: "Neurology", desc: "Brain and nervous system disorders", icon: Brain, path: "/search-doctors?spec=Neurology" },
  { name: "Neurologist", desc: "Brain and nervous system disorders", icon: Brain, path: "/search-doctors?spec=Neurologist" },
  { name: "Physician", desc: "General medical care and diagnosis", icon: Stethoscope, path: "/search-doctors?spec=Physician" },
  { name: "Dentist", desc: "Dental and oral health care", icon: Smile, path: "/search-doctors?spec=Dentist" },
];

const Departments = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <section className="py-16 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Our Departments</h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Browse our medical departments and find the right specialist for your healthcare needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEPARTMENTS.map((dept) => {
              const Icon = dept.icon;
              return (
                <Link
                  key={dept.name}
                  to={dept.path}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-slate-100 p-6 transition-all hover:border-blue-200 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition">
                        {dept.name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">{dept.desc}</p>
                      <span className="inline-block mt-3 text-sm font-medium text-blue-600 group-hover:underline">
                        View doctors →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">
              Don&apos;t see your department? <Link to="/contact" className="text-blue-600 hover:underline">Contact us</Link> for more options.
            </p>
            <Link
              to="/search-doctors"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Search All Doctors
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Departments;
