import { searchUsers } from "../../services/searchApi";
import React, { useState, useEffect } from "react";
import search from "../../../src/assets/Search.png";
import defaultAvatar from "../../assets/default-avatar.png";
import { useNavigate } from "react-router-dom";
import { SearchContext } from "../../context/SearchContext";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
export default function SearchModal() {
  const [results, setResults] = useState([]);
  const { query, setQuery } = useContext(SearchContext);
  const [shoModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    debugger;
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }

      try {
        const res = await searchUsers(query);
        setResults(res);
        console.log(res);
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    const delayDebounce = setTimeout(fetchResults, 400);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const goToSearch = () => {
    navigate("/search");
  };

  return (
    <div>
      <div style={location.pathname !== "/search" ? styles.inputContainer : {...styles.inputContainer, width: 380,height: 38}} >
        <img
          src={search}
          style={{ width: 20, height: 20, marginLeft: 10 }}
          alt="search"
        />
        <input
          placeholder="Search"
          style={ location.pathname !== "/search" ? styles.input : {...styles.input, width: 300,height: "90%"}}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClick={() => {
            if (location.pathname !== "/search") {
              setShowModal(true);
            }
          }}
        />
      </div>

      {shoModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.itemContaoiner}>
            {results.length > 0 ? (
              <div>
                {results.slice(0, 4).map((user) => (
                  <div key={user.username}>
                    <div style={styles.itemContainer}>
                      <img
                        src={user.profileImage || defaultAvatar}
                        alt=""
                        style={styles.avatar}
                      />
                      <p>{user.username}</p>
                    </div>
                    <div style={styles.line} />
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  marginTop: 50,
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#222222",
                }}
              >
                No results found.
              </p>
            )}
          </div>

          <p style={styles.more} onClick={() => goToSearch()}>
            See More
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: "absolute",
    top: 48,
    left: 133,
    width: "220px",
    height: "280px",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderRadius: "10px",
  },

  more: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#0073b1",
    textAlign: "center",
    margin: 0,
    marginTop: "8px",
    cursor: "pointer",
  },

  inputContainer: {
    display: "flex",
    width: 230,
    height: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#222222",
    alignItems: "center",
  },
 
  input: {
    flex: 1,
    height: "90%",
    borderRadius: 20,
    marginLeft: "5px",
    border: "none",
    outline: "none",
  },

  itemContaoiner: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    height: "200px",
    padding: "10px",
    position: "relative",
    width: "91%",
    height: "230px",
  },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    marginRight: 12,
  },

  itemContainer: {
    display: "flex",
    alignItems: "center",
  },

  line: {
    height: "1px",
    backgroundColor: "#eee",
    width: "100%",
    marginBottom: "10px",
  },
};
