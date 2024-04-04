import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import LinearProgress from "@mui/material/LinearProgress";

const series = [
  "Scarlet & Violet",
  "Sword & Shield",
  "Sun & Moon",
  "Black & White",
  "HeartGold & SoulSilver",
  "Platinum",
  "Diamond & Pearl",
  "NP",
  "EX",
  "Other",
  "POP",
  "Gym",
  "Neo",
  "E-Card",
  "XY",
  "Base",
];

function BrowseSets() {
  const navigate = useNavigate();
  const [seriesSets, setSeriesSets] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [isClicked, setClicked] = useState(false);
  const [clickedSeries, setClickedSeries] = useState("");
  const [clickedSet, setClickedSet] = useState("");
  const [dataLoaded, setdataLoaded] = useState(false);

  const getSets = async () => {
    setLoading(true);

    try {
      const response = await fetch("/get-sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: series,
        }),
      });

      const data = await response.json();

      setSeriesSets(data);

      if (!response.ok) {
        throw new Error("Failed to fetch end point");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  function removeNonLetters(str) {
    return typeof str === "string" ? str.replace(/[^a-zA-Z]/g, "") : null;
  }

  function formatDate(originalDate) {
    const parts = originalDate.split("/");
    const formattedDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
    return formattedDate;
  }

  const handleSetClicked = async (clickedSet) => {
    setClicked(true);
    setClickedSeries(clickedSet.series);
    setClickedSet(clickedSet.name);

    try {
      const response = await fetch("/get-set-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: {
            setID: clickedSet.id,
            page: 1,
            pageSize: 32,
          },
        }),
      });

      const data = await response.json();

      navigate(
        `/browse-by-set?${clickedSet.series}=${clickedSet.name}&page=1`,
        {
          state: {
            set: clickedSet,
            setData: data,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch end point");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setClicked(false);
    }
  };

  useEffect(() => {
    getSets();

    document.body.style.overflow = isClicked ? "hidden" : "auto";
  }, [isClicked]);

  useEffect(() => {
    if (seriesSets !== null) {
      setdataLoaded(true);
    }
  }, [seriesSets]);

  return (
    <Container>
      {isClicked && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: 9999,
          }}
        >
          <div className="d-flex align-items-center justify-content-center vh-100">
            <div
              className="text-center loading-div-mobile"
              style={{ width: "20vw" }}
            >
              <h5>
                Loading {clickedSeries} - {clickedSet}
              </h5>
              <LinearProgress
                sx={{
                  backgroundColor: "var(--ghost)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "var(--flying)",
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}
      {isLoading && !isClicked ? (
        <div className="d-flex align-items-center justify-content-center vh-100">
          <div
            className="text-center loading-div-mobile"
            style={{ width: "20vw" }}
          >
            <h5>Loading sets</h5>
            <LinearProgress
              sx={{
                backgroundColor: "var(--ghost)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "var(--flying)",
                },
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <h1
            className="d-flex justify-content-center align-items-center"
            style={{ marginTop: "25px" }}
          >
            Click a set to view all cards in set
          </h1>

          {seriesSets !== null &&
            Object.entries(seriesSets).map(([seriesName, data]) => (
              <React.Fragment key={seriesName}>
                <h1 style={{ marginTop: "80px" }}>{seriesName}</h1>
                <Row
                  key={seriesName}
                  className={`series-row ${
                    dataLoaded ? "series-row-loaded" : ""
                  }`}
                >
                  {Object.entries(data).map(([setName, setData]) => (
                    <Col
                      key={setName}
                      xs={2}
                      sm={2}
                      md={4}
                      className="series-col mx-1 my-1"
                    >
                      <Card className="my-3 series-card">
                        <Card.Img
                          variant="top"
                          src={setData.images.logo}
                          style={{
                            objectFit: "contain",
                            height: "125px",
                          }}
                          className={`card-series-img ${removeNonLetters(
                            setName
                          )}`}
                          onClick={() => handleSetClicked(setData)}
                        />
                        <Card.Body>
                          <Card.Title>
                            <img
                              src={setData.images.symbol}
                              alt={setName}
                              style={{ objectFit: "contain", height: "32px" }}
                            />
                            <h4>{setName}</h4>
                          </Card.Title>
                          <Card.Text style={{ fontSize: "1rem" }}>
                            Release date: {formatDate(setData.releaseDate)}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </React.Fragment>
            ))}
        </>
      )}
    </Container>
  );
}

export default BrowseSets;