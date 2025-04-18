import React from 'react';

//import Breadcrumbs
import Breadcrumbs from "../../components/Common/Breadcrumb";

import {
    Card,
    CardBody,
    Input, 
    Label,
    Col,
    Container,
    Row
} from "reactstrap";


const ManageSites = () => {

    //meta title
    document.title = "Manage Sites | RYD Admin";

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    {/* Render Breadcrumbs */}
                    <Breadcrumbs title="Dashboard" breadcrumbItem="Manage Sites" />
                    <Col lg={6}>
                <div className="mt-4 mt-lg-0">
                    <h5 className="font-size-14 mb-3">Switch to Maintainance Mode</h5>
                    <div className="d-flex flex-wrap gap-2">
                        <div className="square-switch">
                            <Input type="checkbox" id="square-switch1" switch="none" defaultChecked />
                            <Label htmlFor="square-switch1" data-on-label="On"
                                data-off-label="Off"></Label>
                        </div>
                       
                    </div>
                </div>
            </Col>
                   
                </Container>
            </div>
        </React.Fragment>
    );
}

export default ManageSites;
