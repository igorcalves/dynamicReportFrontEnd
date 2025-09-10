import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface ManifestLink {
  name: string;
  path: string;
}

export default function Sidebar() {
  const [manifests, setManifests] = useState<ManifestLink[]>([]);

  useEffect(() => {
  const token = localStorage.getItem("token");
  console.log("token", token);
    fetch("http://localhost:8080/manifests", {
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      }
    })
      .then((res) => res.json())
      .then(setManifests);
  }, []);

  return (
    <div className="w-48 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-lg font-bold mb-6">Relatórios</h2>
      <ul className="space-y-4">
        {manifests.map((m) => (
          <li key={m.path}>
            <Link to={`/${m.path}`}>{m.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
