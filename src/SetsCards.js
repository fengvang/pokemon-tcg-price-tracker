import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Pagination from "@mui/material/Pagination";

function SetsCards({ checkedTypes, checkedSubtypes, hpValue }) {
  const location = useLocation();
  const navigate = useNavigate();
  const set = location.state.set;
  const setData = location.state.setData || location.state.cardData;
  const numPages = parseInt(setData?.totalCount / setData?.pageSize + 1);
  const trueTypes = Object.keys(checkedTypes).filter(
    (key) => checkedTypes[key]
  );
  const trueSubtypes = Object.keys(checkedSubtypes).filter(
    (key) => checkedSubtypes[key]
  );
  const [typeLength, setTypeLength] = useState(0);

  // get page from url =P fixes problem of when click in individual card
  // and navigating back which results in pagination to land on incorrect page
  const [currentPage, setCurrentPage] = useState(
    parseInt(location.search.substring(location.search.lastIndexOf("=") + 1))
  );

  const handleCardClick = (clickedCard) => {
    if (clickedCard.supertype === "Pokémon") {
      navigate(`/card?${clickedCard.name}`, {
        state: {
          prevURL: { path: location.pathname, search: location.search },
          originalCardData: setData,
          cardData: clickedCard,
          set: set,
          query: {
            name: clickedCard.name,
          },
        },
      });
    } else console.log("Not working");
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);

    try {
      const response = await fetch("/get-set-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: {
            setID: set.id,
            page: page,
            pageSize: 32,
          },
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const cardData = await response.json();

      navigate(`/browse-by-set?${set.series}=${set.name}&page=${page}`, {
        state: {
          set: set,
          setData: cardData,
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // filtering not working
  const handleFilterChange = async () => {
    try {
      const response = await fetch("/filter-set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: {
            setID: set.id,
            type: trueTypes,
            subtype: trueSubtypes,
            page: 1,
            pageSize: 32,
          },
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const cardData = await response.json();

      navigate(
        `/browse-by-set?${set.series}=${set.name}&types=${trueTypes}&page=${1}`,
        {
          state: {
            set: set,
            setData: cardData,
          },
        }
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    console.log("trueTypes.length", trueTypes.length);
    console.log("typeLength", typeLength);
    if (trueTypes.length !== typeLength && trueTypes.length !== 0) {
      console.log("change detected");
      setTypeLength(trueTypes.length);
      handleFilterChange();
    }

    // eslint-disable-next-line
  }, [trueTypes, trueSubtypes, typeLength]);

  return (
    <Container>
      <Row id="card-results-count">
        {setData?.length === 0 ? (
          <h5 className="my-3 d-flex align-items-center justify-content-center">
            No data found
          </h5>
        ) : (
          setData?.data.map((card) => (
            <Col key={card.id} xs={6} sm={6} md={3} lg={3} xl={3}>
              <Card
                className="my-3 d-flex justify-content-center align-items-center"
                style={{ padding: "0px" }}
              >
                <Card.Img
                  className="card-image"
                  src={card.images.large}
                  alt={card.name}
                  style={{ width: "100%" }}
                  onClick={() => handleCardClick(card)}
                  onLoad={(e) => e.target.classList.add("card-image-loaded")}
                />
              </Card>
            </Col>
          ))
        )}
      </Row>
      <Row>
        {window.innerWidth < 576 ? (
          <Pagination
            count={numPages}
            color="primary"
            shape="rounded"
            variant="outlined"
            showFirstButton={true}
            showLastButton={true}
            hideNextButton={true}
            hidePrevButton={true}
            boundaryCount={1}
            siblingCount={1}
            page={currentPage}
            onChange={(event, page) => handlePageChange(page)}
          />
        ) : (
          <Pagination
            count={numPages}
            color="primary"
            shape="rounded"
            variant="outlined"
            showFirstButton={true}
            showLastButton={true}
            boundaryCount={1}
            siblingCount={4}
            page={currentPage}
            onChange={(event, page) => handlePageChange(page)}
          />
        )}
      </Row>
    </Container>
  );
}

export default SetsCards;