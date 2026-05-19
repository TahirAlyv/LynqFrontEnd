import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import Navbar from "../../Layout/Navbar";
import defaultAvatar from "../../../assets/default-avatar.png";
import specialty from "../../../assets/specialty.png";
import edit from "../../../assets/edit.png";
import { useNavigate } from "react-router-dom";
 

const EmployerProfileView = ({
  user,
  setUser,
  isOwner,
  readOnly,
  likeConnection,
}) => {
  const [employer, setEmployer] = useState(user || null);
  const [selectedButton, setSelectedButton] = useState("About");
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const [form, setForm] = useState({
    bio: user?.bio || "",
    industry: user?.industry || "",
    website: user?.website || "",
    location: user?.location || "",
  });

  useEffect(() => {
    setEmployer(user || null);
    setForm({
      bio: user?.bio || "",
      industry: user?.industry || "",
      website: user?.website || "",
      location: user?.location || "",
    });
  }, [user]);

  if (!employer) return <div>Loading...</div>;

  const handleInputChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await api.put("/user/employer/about", form);
      alert("Company info updated successfully!");
      setShowModal(false);

      const res = await api.get("/user/me");
      setEmployer(res.data);

      if (setUser) {
        setUser(res.data);
      }
    } catch (err) {
      console.error("Update failed", err);
      alert("Update failed!");
    }
  };

  const handleMessage = () => {
    navigate(`/messages/${employer.userName}`);
  };

  return (
    <>
      <Navbar />

      <div style={styles.pageWrapper}>
        <div style={styles.profileContainer}>
          <img
            style={styles.profilePage}
            src={
              employer.logoUrl
                ? `https://localhost:7257/${employer.logoUrl}`
                : defaultAvatar
            }
            alt="company-logo"
          />

          <div style={styles.nameContainer}>
            <span style={{ fontSize: 20, fontWeight: 600 }}>
              {employer.companyName}
            </span>

            <span style={{ fontSize: 16, fontWeight: 300 }}>
              @{employer.userName}
            </span>

            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                style={{ height: 20, marginTop: 5 }}
                src={specialty}
                alt="specialty"
              />
              <span style={styles.specialty}>{employer.industry}</span>
            </div>

            <div>
              {!isOwner && <button style={{ marginRight: 10 }}>Follow</button>}
              {!isOwner && <button onClick={handleMessage}>Message</button>}
            </div>
          </div>

          {!readOnly && (
            <img
              onClick={() => setShowModal(true)}
              style={{
                width: 35,
                marginBottom: 60,
                marginLeft: 400,
                cursor: "pointer",
              }}
              src={edit}
              alt="edit"
            />
          )}
        </div>

        <div style={{ display: "flex", marginRight: 465, gap: 7 }}>
          {["About", "Posts", "Job Postings"].map((label) => (
            <button
              key={label}
              onClick={() => setSelectedButton(label)}
              style={{
                ...styles.selectButton,
                backgroundColor:
                  selectedButton === label ? "#0068d8ff" : "#2991ffff",
                width: label === "Job Postings" ? "90px" : "60px",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {selectedButton === "About" && (
          <div style={styles.aboutMainContainer}>
            <div
              style={{
                ...styles.aboutContainer,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={styles.aboutTitle}>Overview</span>

              {!readOnly && (
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    backgroundColor: "#0673e7ff",
                    border: "none",
                    color: "white",
                    borderRadius: 6,
                    padding: "5px 20px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              )}
            </div>

            <div style={styles.aboutContainer}>
              <span style={styles.aboutTitle}>Bio</span>
              <p>{employer.bio || "Not provided"}</p>
            </div>

            <div style={styles.aboutContainer}>
              <span style={styles.aboutTitle}>Industry</span>
              <p>{employer.industry || "Not provided"}</p>
            </div>

            <div
              style={{
                ...styles.aboutContainer,
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              <span style={styles.aboutTitle}>Website</span>
              {employer.website ? (
                <a
                  href={
                    employer.website.startsWith("http")
                      ? employer.website
                      : `https://${employer.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0068d8", textDecoration: "none" }}
                >
                  {employer.website}
                </a>
              ) : (
                <p>Not provided</p>
              )}
            </div>

            <div
              style={{
                ...styles.aboutContainer,
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              <span style={styles.aboutTitle}>Location</span>
              {employer.location ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    employer.location
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0068d8", textDecoration: "none" }}
                >
                  {employer.location}
                </a>
              ) : (
                <p>Not provided</p>
              )}
            </div>
          </div>
        )}

        {selectedButton === "Posts" && (
          <div style={{ width: "700px" }}>
            {/* {!readOnly && <EmployerPostCreate />}
            <EmployerPosts
              userId={employer.id}
              likeConnection={likeConnection}
              isOwner={isOwner}
            /> */}
          </div>
        )}

        {selectedButton === "Job Postings" && (
          <div style={{ width: "700px" }}>
            {!readOnly && <EmployerJobCreate />}
            {/* <EmployerJobPosts userId={employer.id} /> */}
          </div>
        )}
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Edit Company Info</h3>

            <label>Bio:</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleInputChange}
              style={{ ...styles.input, height: 150 }}
            />

            <label>Industry:</label>
            <input
              name="industry"
              value={form.industry}
              onChange={handleInputChange}
              style={styles.input}
            />

            <label>Website:</label>
            <input
              name="website"
              value={form.website}
              onChange={handleInputChange}
              style={styles.input}
            />

            <label>Location:</label>
            <input
              name="location"
              value={form.location}
              onChange={handleInputChange}
              style={styles.input}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 10,
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button onClick={handleUpdate} style={styles.saveButton}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployerProfileView;

const styles = {
  pageWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "40px",
    backgroundColor: "#e9e9e9ff",
    minHeight: "100vh",
    flexDirection: "column",
  },
  profileContainer: {
    width: "700px",
    height: "180px",
    borderRadius: "12px",
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
  },
  profilePage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    objectFit: "cover",
    marginLeft: 15,
  },
  nameContainer: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 20,
    marginLeft: 20,
    gap: 2,
    fontFamily: "system-ui, sans-serif",
  },
  specialty: {
    fontSize: 14,
  },
  aboutMainContainer: {
    width: "700px",
    minHeight: "180px",
    borderRadius: "12px",
    backgroundColor: "white",
  },
  aboutContainer: {
    padding: 8,
    width: "95%",
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 600,
  },
  selectButton: {
    border: "none",
    backgroundColor: "#0082ceff",
    color: "white",
    width: 60,
    height: 32,
    borderRadius: 10,
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "400px",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    marginTop: 5,
    marginBottom: 10,
    padding: 6,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  cancelButton: {
    backgroundColor: "#999",
    border: "none",
    color: "white",
    borderRadius: 6,
    padding: "6px 12px",
    cursor: "pointer",
  },
  saveButton: {
    backgroundColor: "#0068d8",
    border: "none",
    color: "white",
    borderRadius: 6,
    padding: "6px 12px",
    cursor: "pointer",
  },
};