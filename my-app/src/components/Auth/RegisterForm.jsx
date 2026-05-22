import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  registerStart,
  registerSuccess,
  registerFailure,
} from "../../store/userSlice";
import api from "../../services/api";
import PersonalAccount from "../../assets/PersonalAccount.png";
import CompanyAccount from "../../assets/CompanyAccount.png";

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  const [accountType, setAccountType] = useState("personal");
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",

    fullName: "",

    companyName: "",
    industry: "",
    website: "",

    bio: "",
    location: "",
  });

  const isCompany = accountType === "company";

  const pageSubtitle = useMemo(() => {
    if (isCompany) {
      return "Create your company profile and start hiring.";
    }

    return "Create your personal profile and get started.";
  }, [isCompany]);

  const getErrorMessage = (err) => {
    const data = err?.response?.data;

    if (!data) return err.message || "Registration failed.";

    if (typeof data === "string") return data;

    if (Array.isArray(data)) {
      return data.map((item) => item.description || item.message || item).join(" ");
    }

    if (data.message) return data.message;

    if (data.title) return data.title;

    if (data.errors) {
      const allErrors = Object.values(data.errors).flat();
      return allErrors.join(" ");
    }

    return "Registration failed.";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormError("");
    dispatch(registerFailure(null));

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectType = (type) => {
    setAccountType(type);
    setFormError("");
    dispatch(registerFailure(null));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setFormError("Username is required.");
      return false;
    }

    if (!formData.email.trim()) {
      setFormError("Email is required.");
      return false;
    }

    if (!formData.password.trim()) {
      setFormError("Password is required.");
      return false;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match.");
      return false;
    }

    if (isCompany) {
      if (!formData.companyName.trim()) {
        setFormError("Company name is required.");
        return false;
      }
    } else {
      if (!formData.fullName.trim()) {
        setFormError("Full name is required.");
        return false;
      }
    }

    return true;
  };

  const buildPayload = () => {
    if (isCompany) {
      return {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        name: formData.companyName.trim(),
        industry: formData.industry.trim() || null,
        website: formData.website.trim() || null,
        bio: formData.bio.trim() || null,
        location: formData.location.trim() || null,
      };
    }

    return {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      fullName: formData.fullName.trim(),
      bio: formData.bio.trim() || null,
      location: formData.location.trim() || null,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!validateForm()) return;

    dispatch(registerStart());

    try {
      const payload = buildPayload();

      const endpoint = isCompany
        ? "/Auth/employers/register"
        : "/Auth/jobseekers/register";

      const response = await api.post(endpoint, payload);

      dispatch(registerSuccess(response.data));
      navigate("/login");
    } catch (err) {
      const message = getErrorMessage(err);
      dispatch(registerFailure(message));
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create your account</h1>
          <p style={styles.subtitle}>{pageSubtitle}</p>
        </div>

        <div style={styles.typeGrid}>
          <button
            type="button"
            onClick={() => handleSelectType("personal")}
            style={{
              ...styles.typeCard,
              ...(accountType === "personal" ? styles.typeCardActive : {}),
            }}
          >
            <img
              src={PersonalAccount}
              alt="Personal Account"
              style={styles.typeIcon}
            />

            <div style={styles.typeTitle}>Personal Account</div>

            <div style={styles.typeText}>
              Build your profile, add experience, and share posts.
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectType("company")}
            style={{
              ...styles.typeCard,
              ...(accountType === "company" ? styles.typeCardActive : {}),
            }}
          >
            <img
              src={CompanyAccount}
              alt="Company Account"
              style={styles.typeIcon}
            />

            <div style={styles.typeTitle}>Company Account</div>

            <div style={styles.typeText}>
              Create a company profile, share posts, and publish job openings.
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {isCompany ? (
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Company name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  style={styles.input}
                />
              </div>
            </div>
          ) : (
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Full name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  style={styles.input}
                />
              </div>
            </div>
          )}

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Example: Baku, Azerbaijan"
                style={{ ...styles.input, marginBottom: 0 }}
              />

              <div style={styles.hint}>
                This will be shown on your profile.
              </div>
            </div>
          </div>

          {isCompany && (
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="Example: Software Development"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Website</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Example: https://company.com"
                  style={styles.input}
                />
              </div>
            </div>
          )}

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Confirm password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              {isCompany ? "Company bio" : "Bio"}
            </label>

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder={
                isCompany
                  ? "Write a short description about your company"
                  : "Write a short bio"
              }
              style={styles.textarea}
            />
          </div>

          {(formError || error) && (
            <div style={styles.errorBox}>{formError || error}</div>
          )}

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading
              ? "Creating account..."
              : isCompany
              ? "Create company account"
              : "Create account"}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Already have an account?</span>

          <Link to="/login" style={styles.loginLink}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f2ef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    width: "100%",
    maxWidth: "880px",
    background: "#fff",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e7e7e7",
    padding: "32px",
  },
  header: {
    marginBottom: "28px",
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: 700,
    color: "#1f1f1f",
    letterSpacing: "-0.6px",
  },
  subtitle: {
    margin: "10px 0 0",
    fontSize: "15px",
    color: "#666",
    lineHeight: 1.5,
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },
  typeCard: {
    position: "relative",
    textAlign: "left",
    background: "#fff",
    border: "1.5px solid #dddddd",
    borderRadius: "16px",
    padding: "20px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  typeCardActive: {
    border: "2px solid #0a66c2",
    boxShadow: "0 0 0 4px rgba(10, 102, 194, 0.08)",
  },
  typeIcon: {
    width: "40px",
    height: "40px",
    marginBottom: "16px",
  },
  typeTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1f1f1f",
    marginBottom: "8px",
  },
  typeText: {
    fontSize: "14px",
    color: "#5f5f5f",
    lineHeight: 1.5,
    maxWidth: "320px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#303030",
    marginBottom: "8px",
  },
  input: {
    height: "48px",
    border: "1px solid #d0d0d0",
    borderRadius: "12px",
    padding: "0 14px",
    fontSize: "14px",
    outline: "none",
    background: "#fff",
  },
  textarea: {
    minHeight: "110px",
    border: "1px solid #d0d0d0",
    borderRadius: "12px",
    padding: "14px",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  errorBox: {
    borderRadius: "12px",
    background: "#fff1f1",
    border: "1px solid #f3c4c4",
    color: "#b42318",
    padding: "12px 14px",
    fontSize: "14px",
  },
  submitButton: {
    height: "50px",
    border: "none",
    borderRadius: "999px",
    background: "#0a66c2",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "6px",
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    marginTop: "24px",
    fontSize: "14px",
  },
  footerText: {
    color: "#666",
  },
  loginLink: {
    color: "#0a66c2",
    textDecoration: "none",
    fontWeight: 700,
  },
  hint: {
    fontSize: "12px",
    color: "#777",
    marginTop: "4px",
  },
};

export default RegisterForm;