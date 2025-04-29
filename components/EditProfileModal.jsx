"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [bio, setBio] = useState(user.bio || "");
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [selectedGender, setSelectedGender] = useState(user.gender || "");
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = process.env.STRAPI_URL;

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/cities`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const citiesData = response.data.data.map((city) => ({
          id: city.id,
          name: city.name,
        }));
        setCities(citiesData);
        if (user.city?.id) {
          setSelectedCity(user.city.id);
        }
      } catch (error) {
        console.error("Lỗi khi fetch cities:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCities();
  }, [user, API_URL]);

  useEffect(() => {
    if (selectedCity) {
      const fetchDistricts = async () => {
        try {
          setIsLoading(true);
          const token = localStorage.getItem("token");
          const response = await axios.get(`${API_URL}/api/districts`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              filters: {
                city: {
                  id: { $eq: selectedCity },
                },
              },
            },
          });
          const districtsData = response.data.data.map((district) => ({
            id: district.id,
            name: district.name,
          }));
          setDistricts(districtsData);
          if (
            user.district?.id &&
            districtsData.some((d) => d.id === user.district.id)
          ) {
            setSelectedDistrict(user.district.id);
          } else {
            setSelectedDistrict("");
          }
        } catch (error) {
          console.error("Lỗi khi fetch districts:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setSelectedDistrict("");
    }
  }, [selectedCity, user, API_URL]);

  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        try {
          setIsLoading(true);
          const token = localStorage.getItem("token");
          const response = await axios.get(`${API_URL}/api/wards`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              filters: {
                district: {
                  id: { $eq: selectedDistrict },
                },
              },
            },
          });
          const wardsData = response.data.data.map((ward) => ({
            id: ward.id,
            name: ward.name,
          }));
          setWards(wardsData);
          if (user.ward?.id && wardsData.some((w) => w.id === user.ward.id)) {
            setSelectedWard(user.ward.id);
          } else {
            setSelectedWard("");
          }
        } catch (error) {
          console.error("Lỗi khi fetch wards:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchWards();
    } else {
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedDistrict, user, API_URL]);

  const handleSave = () => {
    const updatedData = {
      name,
      gender: selectedGender,
      phone,
      city: selectedCity
        ? {
            disconnect: [],
            connect: [
              {
                id: selectedCity,
              },
            ],
          }
        : null,
      district: selectedDistrict
        ? {
            disconnect: [],
            connect: [
              {
                id: selectedDistrict,
              },
            ],
          }
        : null,
      ward: selectedWard
        ? {
            disconnect: [],
            connect: [
              {
                id: selectedWard,
              },
            ],
          }
        : null,
      bio,
    };
    onSave(updatedData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center p-4">
      <div className="bg-white border-4 border-black w-full max-w-lg transform -rotate-1">
        <div className="border-b-4 border-black p-4 bg-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-black">SỬA HỒ SƠ</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200">
            <IoIosClose size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block font-bold mb-2 uppercase">
                Họ và tên:
              </label>
              <input
                type="text"
                className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold mb-2 uppercase">
                Giới tính:
              </label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black"
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2 uppercase">
                Số điện thoại:
              </label>
              <input
                type="text"
                className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold mb-2 uppercase">
                Thành phố:
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black"
                disabled={isLoading}
              >
                <option value="">Chọn Thành phố</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2 uppercase">
                Quận/Huyện:
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black"
                disabled={!selectedCity || isLoading}
              >
                <option value="">
                  {selectedCity ? "Chọn Quận/Huyện" : "Chọn Thành phố trước"}
                </option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2 uppercase">
                Phường/Xã:
              </label>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black"
                disabled={!selectedDistrict || isLoading}
              >
                <option value="">
                  {selectedDistrict
                    ? "Chọn Phường/Xã"
                    : "Chọn Quận/Huyện trước"}
                </option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2 uppercase">
                Giới thiệu:
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full h-40 p-3 border-4 border-black focus:ring-0 focus:border-black"
                placeholder="Viết một vài điều về bạn..."
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-3 border-4 border-black bg-yellow-custom font-bold transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              disabled={isLoading}
            >
              {isLoading ? "ĐANG XỬ LÝ..." : "LƯU THAY ĐỔI"}
            </button>

            <button
              onClick={onClose}
              className="px-6 py-3 border-4 border-black font-bold transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              HỦY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
