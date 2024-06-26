import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Col, Button, InputGroup } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import SyncLoader from "react-spinners/SyncLoader";

function SearchForm() {
  const [pokemonName, setpokemonName] = useState("");
  const [pokemonSubtype, setPokemonSubtype] = useState("");
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // set pokemon name
  const handleInputChange = (event) => {
    setpokemonName(event.target.value);
    localStorage.setItem("pokemonName", event.target.value);
  };

  // set pokemon subtype (optional)
  const handlePokemonSubtypeChange = (event) => {
    setPokemonSubtype(event.target.value);
    localStorage.setItem("pokemonSubtype", event.target.value);
  };

  // event for enter key on keyboard
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchCard();
    }
  };

  // get card data for provided pokemon name and subtype if provided
  const searchCard = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://us-central1-pokebinder-ae627.cloudfunctions.net/app/search-card",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: {
              name: pokemonName,
              subtype: pokemonSubtype,
              page: 1,
              pageSize: 36,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch end point");
      }

      // store response
      const cardData = await response.json();

      const url =
        (pokemonSubtype && pokemonName === null) || pokemonName === undefined
          ? `/results?${pokemonSubtype}&page=1`
          : (pokemonName && pokemonSubtype === null) ||
            pokemonSubtype === undefined
          ? `/results?${pokemonName}&page=1`
          : `/results?${pokemonName}${pokemonSubtype}&page=1`;

      if (pokemonSubtype === "") localStorage.setItem("pokemonSubtype", "All");

      // navigate to next page with results
      navigate(url, {
        state: {
          cardData: cardData,
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5">
      <Col className="d-flex justify-content-center align-items-center">
        <h1>Search for Pokémon Card</h1>
      </Col>

      <Col
        className="d-flex justify-content-center align-items-center"
        style={{ marginBottom: "25px" }}
      >
        <Form>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search card by name"
              value={pokemonName}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="main-search-bar"
            />
            <Form.Select
              aria-label="Subtype dropdown"
              bsPrefix="subtype-select"
              value={pokemonSubtype}
              onChange={handlePokemonSubtypeChange}
              onKeyDown={handleKeyPress}
            >
              <option defaultValue="">Subtype</option>
              <option value="All">All</option>
              <option value="BREAK">BREAK</option>
              <option value="Baby">Baby</option>
              <option value="Basic">Basic</option>
              <option value="ex">ex</option>
              <option value="EX">EX</option>
              <option value="GX">GX</option>
              <option value='"Goldenrod Game Corner"'>
                Goldenrod Game Corner
              </option>
              <option value="Item">Item</option>
              <option value="LEGEND">LEGEND</option>
              <option value="Level-Up">Level-Up</option>
              <option value="MEGA">MEGA</option>
              <option value='"Pokémon Tool"'>Pokémon Tool</option>
              <option value='"Pokémon Tool F"'>Pokémon Tool F</option>
              <option value='"Rapid Strike"'>Rapid Strike</option>
              <option value="Restored">Restored</option>
              <option value='"Rocket&apos;s Secret Machine"'>
                Rocket's Secret Machine
              </option>
              <option value='"Single Strike"'>Single Strike</option>
              <option value="Special">Special</option>
              <option value="Stadium">Stadium</option>
              <option value='"Stage 1"'>Stage 1</option>
              <option value='"Stage 2"'>Stage 2</option>
              <option value="Supporter">Supporter</option>
              <option value='"TAG TEAM"'>TAG TEAM</option>
              <option value='"Technical Machine"'>Technical Machine</option>
              <option value="Tera">Tera</option>
              <option value="V">V</option>
              <option value="VMAX">VMAX</option>
            </Form.Select>
            <Button className="search-button" onClick={searchCard}>
              <i className="bi bi-search"></i>
            </Button>
          </InputGroup>
        </Form>
      </Col>

      {isLoading && location.pathname === "/" ? (
        <Col className="d-flex flex-column justify-content-center align-items-center">
          <SyncLoader
            size={8}
            color="#ffffff"
            style={{ marginBottom: "25px" }}
          />
        </Col>
      ) : isLoading && location.pathname !== "/" ? (
        <Col className="d-flex flex-column justify-content-center align-items-center loading-div">
          <SyncLoader
            size={8}
            color="#ffffff"
            style={{ marginBottom: "25px" }}
          />
        </Col>
      ) : null}

      <div
        className="d-flex justify-content-center align-items-center"
        style={{ fontSize: ".78em" }}
      >
        <Link to="/search-by-set">Want to search by sets instead?</Link>
      </div>
    </div>
  );
}

export default SearchForm;
