import React, { useEffect, useRef, useState } from 'react';
import withAuth from '../withAuth';
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Card, CardBody, Col, Container, Input, Row, } from "reactstrap";
import axios from 'axios';
import { baseUrl, promoUrl } from '../../Network';
import { useParams } from 'react-router-dom';
import { checkPromoProgram, newFormatDate, totalCohortChild, totalCohortParent } from '../../utils';
import FeatherIcon from 'feather-icons-react/build/FeatherIcon';
import { ToastContainer, toast } from 'react-toastify';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [migration, setMigration] = useState(false);
  const [promo, setPromo] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterData, setFilterData] = useState([]);
  const [programData, setProgramData] = useState([
    { title: "Total Programs", count: 0, statusColor: "primary" },
    { title: "Teacher Assigned", count: 0, statusColor: "success" },
    { title: "Enrolled", count: 0, statusColor: "danger" },
    // { title: "Total Debt", count: 0, statusColor: "secondary" }
  ]);

  const { id } = useParams()
  const WEB_APP_USER_URL = window.location.host;
  const inputRef = useRef(null);


  useEffect(() => {
    document.title = "Promo Dashboard | RYD Admin";
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch parent count
      const promoDashboardResponse = await axios.get(`${baseUrl}/admin/promo/dashboard/${id}`);
      if (promoDashboardResponse) {
        setLoading(false)
        const parentCount = promoDashboardResponse.data.data.parents?.length;
        const programCount = promoDashboardResponse.data.data.programs?.length;
        const childCount = promoDashboardResponse.data.data.totalStudent;
        //filter cohort before my account
        const pDate = new Date(promoDashboardResponse.data.data.promo.createdAt)
        pDate.setHours(0, 0, 0, 0)
        pDate.setDate(1)
        const cd = promoDashboardResponse.data.data.programs
        // .filter(f => {
        //   const dd = new Date(f.createdAt)
        //   dd.setDate(1)
        //   dd.setHours(0, 0, 0, 0)
        //   return dd>=pDate
        // })
        setPrograms(cd)
        setFilterData(cd);
        setPromo(promoDashboardResponse.data.data.promo)
        setProgramData([
          { title: "Total Programs", count: programCount, statusColor: "primary" },
          { title: "Total Child", count: childCount, statusColor: "success" },
          { title: "Total Parents", count: parentCount, statusColor: "danger" },
          // { title: "Total Debt", count: (promoDashboardResponse.data.data?.rate?.currencyCode || "$") +debtCount, statusColor: "secondary" }
        ]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  function filterTableData(data, searchQuery) {
    return data.filter((cohort) => {
      const searchText = searchQuery.toLowerCase();
      return (
        cohort.title.toLowerCase().includes(searchText)
      );
    });
  }

  useEffect(()=>{
    if(id){
      checkMigration()
    }
  },[id])

  const checkMigration = async()=>{
    const response = await axios.get(`${baseUrl}/common/migration/check/${id}`);
    console.log(response)
    if(!response.data.status){
      setMigration(false)
      return;
    }else{
      setMigration(response.data.data.status)
    }
  }

  useEffect(() => {
    if (searchQuery) {
      setFilterData(filterTableData(programs, searchQuery));
    } else {
      setFilterData(programs);
    }
  }, [searchQuery]);

  const handleCopy = () => {
    if (inputRef.current) {
      inputRef.current.select();
      document.execCommand("copy");
    }
    toast.success("Promo link copied successfully!");
  };


  const handlPromoRegistration = async (status) => {
    setLoading(true)
    try {
      const response = await axios.put(`${baseUrl}/admin/promo/registration/${status ? `enable` : `disable`}/${id}`);
      if (!response.status) {
        toast.error(response.message);
        return;
      }
      toast.success(`Promo link ${status ? "ENABLED" : "DISABLED"} successfully`);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to disable promo");
    }
  };

  const handleMigration= async (status) => {
    setLoading(true)
    try {
      if(status){
        const data = {
          id,
          status: false
        }
        const response = await axios.put(`${baseUrl}/admin/promo/migration/disable`, data);
        if (!response.status) {
          toast.error(response.message);
          return;
        }
        toast.success(`Migration DISABLED successfully`);
      }else{
        const data = {
          promoId: id
        }
        const response = await axios.post(`${baseUrl}/admin/promo/migration`, data);
        if (!response.status) {
          toast.error(response.message);
          return;
        }
        toast.success(`Migration ENABLED successfully`);
      }
      window.location.reload();
    } catch (error) {
      console.log(error)
      toast.error(" MIGRATION request failed");
    }
  };

  console.log(migration)

  return (
    <React.Fragment>
      <ToastContainer />
      <div className="page-content">
        <Container fluid>
          <Row>
            <Breadcrumbs title="Manage Promo" breadcrumbItem={`${promo ? promo.title : ""} Dashboard`} />
            {programData.map((card, index) => (
              <Col key={index} xl={4} md={6}>
                <Card className="card-h-100">
                  <CardBody>
                    <h4 className="mb-3">{card.title}</h4>
                    <div className={"badge bg-" + card.statusColor + "-subtle text-" + card.statusColor + " mb-3"} style={{ fontSize: "15px", padding: "10px" }}>
                      {card.count}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
            <Col>
              <span
                onClick={(e) => {
                  if (confirm(`Are you sure you want to ${migration ? `DISABLE` : `ENABLE`} parent migration for ${promo.title}?`)) {
                    handleMigration(migration)
                  }
                }}
                className={`btn ${migration? "btn-danger" : "btn-success" }`}>
                {migration ? "Disable Migaration" :  "Enable Migration" }
              </span>
            </Col>
          <div className="my-5">
            <p>Promo Link</p>
            <Col>
              <form className="mt-3">
                <Row>
                  <Col>
                    <div className="promo">
                      <input
                        type="text"
                        readOnly
                        ref={inputRef}
                        value={`${promoUrl === "" ? WEB_APP_USER_URL : promoUrl}/parent/register/${id ? parseInt(id) + 100 : ""
                          }`}
                        className="text-[#000] placeholder:text-[#000] border-[0.5px] border-[#000] rounded-md mr-2 px-2 w-600px text-xs py-2"
                      />
                      <div
                        className="absolute right-3 top-[0.1px] cursor-pointer"
                        onClick={handleCopy}

                      >
                        <FeatherIcon
                          icon="copy"
                        />{" "}
                      </div>
                    </div>
                  </Col>
                  {promo ?
                    <Col>
                      <span
                        onClick={(e) => {
                          if (confirm(`Are you sure you want to ${promo.isActive ? `ENABLE` : `DISABLE`} ${promo.title}?`)) {
                            handlPromoRegistration(promo.isActive)
                          }
                        }}
                        className={`btn ${promo.isActive ? "btn-success" : "btn-danger"}`}>
                        {promo.isActive ? "Enable Link" : "Disable Link"}
                      </span>
                    </Col> : <></>}
                </Row>
              </form>
            </Col>
          </div>
          <Row className="align-items-center">
            <Col md={6}>
              <div className="mb-3">
                <h5 className="card-title">
                  Programs List{" "}
                  <span className="text-muted fw-normal ms-2">
                    ({programs.length})
                  </span>
                </h5>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 mb-3">
                <div>
                  <Input
                    type="text"
                    placeholder="Search"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xl="12">
              {loading ? (
                <div className="text-center mt-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filterData.length === 0 ? (
                <div className="text-center mt-5">
                  <h3>No data available</h3>
                </div>
              ) : (
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Parent Name</th>
                      <th>Child Name	</th>
                      <th>Country</th>
                      <th>Gender</th>
                      {/* <th>N</th>
                      <th>Status</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {filterData.map((p, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{p?.child.parent.firstName + " " + p?.child.parent.lastName}</td>
                        <td>{p?.child.firstName + " " + p?.child.lastName}</td>
                        <td>{p?.child.parent.country}</td>
                        <td>{p?.child.gender}</td>
                        {/* <td>{newFormatDate(p?.startDate)}</td>
                        <td>{newFormatDate(p?.startDate)}</td> */}
                        {/* <td>{totalCohortChild(p.promo_programs, parseInt(id))}</td>
                        <td>{totalCohortParent(p.promo_programs, parseInt(id))}</td> */}
                        {/* <td>{p.status ? (
                          <p className=" bg-custom-yellow  font-normal text-yellow-600 text-center p-1 rounded-2xl" style={{ background: "rgba(255, 255, 0, 0.147)", color: "blavk" }}>
                            Ongoing
                          </p>
                        ) : (
                          <p className=" bg-[#E7F6EC] font-normal text-[#0F973D] text-center p-1 rounded-2xl" style={{ background: "#E7F6EC", color: "#0F973D" }}>
                            Completed
                          </p>
                        )}</td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>


              )}
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default withAuth(Dashboard);
