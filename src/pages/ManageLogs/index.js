import React, {useEffect, useState} from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axios from "axios";
import withAuth from "../withAuth";
import {baseUrl} from '../../Network';
import {Button, Col, Container, Input, Row,} from "reactstrap";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageTestimonial = () => {
    document.title = "Audit Logs | RYD Admin";

    const [loading, setLoading] = useState(false);
    const [audits, setAudit] = useState([]);
    const [auditData, setAuditData] = useState([]);
    const [auditCat, setAuditCat] = useState([]);
    const [date1, setDate1] = useState("");
    const [date2, setDate2] = useState("");

    useEffect(() => {
        fetchAuditLog();
    }, []);

    const fetchAuditLog = async () => {
        try {
            const response = await axios.get(`${baseUrl}/admin/audit/all`);
            setAudit(response.data.data);
            setAuditData(response.data.data);
            _captureAuditCategory(response.data.data)
            setLoading(true);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    //filter for items
    const _captureAuditCategory = (d) => {
        let _arr = [];
        d.forEach((item) => {
            _arr.push(item.title.split("/")[2]);
        })
        if (_arr.length > 0) {
            setAuditCat([...new Set(_arr)])
        }
    }

    function cFLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    //shake your bum bum if anything sup with date1 or 2
    useEffect(() => {
        filterByDateRange()
    }, [date1, date2])

    const filterByDateRange = () => {
        if (date1) {
            //filter begin
            setAuditData(audits.filter((item) => {
                return new Date(item.timestamp) >= new Date(date1 || new Date()) && new Date(item.timestamp) <= new Date(date2 || new Date());
            }))
        }
        console.log("filterByDateRange", date1, date2);
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Dashboard" breadcrumbItem="Audit Logs"/>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <div className="mb-3">

                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 mb-3">
                                <span>Action Type</span>
                                <div style={{width: 200}}>
                                    <select className={'form-control'} onChange={(e) => {
                                        //update table
                                        setAuditData(audits.filter(item => item.title.includes(e.target.value)));
                                    }}>
                                        <option value={''}>All</option>
                                        {auditCat.map((item, index) => <option key={index}
                                                                               value={item}>{cFLetter(item)}</option>)}
                                    </select>
                                </div>
                                <span>From</span>
                                <div style={{width: 200}}>
                                    <Input
                                        type="date"
                                        placeholder="date from"
                                        onChange={(e) => setDate1(e.target.value)}
                                    />
                                </div>
                                <span>To</span>
                                <div>
                                    <Input
                                        type="date"
                                        placeholder="date to"
                                        onChange={(e) => setDate2(e.target.value)}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg="12">
                            <Row>
                                <Col xl="12">
                                    {loading ? (
                                        <div className="text-center mt-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <table className="table align-middle">
                                                <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Title</th>
                                                    <th>Agent</th>
                                                    <th>Reason(s)</th>
                                                    <th>Time</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {Array.isArray(auditData) && auditData.length > 0 ? (
                                                    auditData.map((audit, index) => (
                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>{audit?.title}</td>
                                                            <td>{audit?.agent}</td>
                                                            <td>{audit?.reasons}</td>
                                                            <td>{new Date(audit?.timestamp).toUTCString()}</td>
                                                        </tr>
                                                    ))
                                                ) : null}
                                                </tbody>
                                            </table>
                                            {!Array.isArray(audits) || audits.length === 0 && (
                                                <div className="text-center mt-5">
                                                    <h3>No data available</h3>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </Col>
                            </Row>

                        </Col>
                    </Row>
                </Container>
            </div>
            <ToastContainer/>
        </React.Fragment>
    );
};

export default withAuth(ManageTestimonial);
