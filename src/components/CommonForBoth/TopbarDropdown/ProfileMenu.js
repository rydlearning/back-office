import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
} from "reactstrap";

//i18n
import { withTranslation } from "react-i18next";
// Redux
import { connect } from "react-redux";
import { Link } from "react-router-dom";

// users
import user1 from "../../../assets/images/users/avatar-1.jpg";

const ProfileMenu = props => {
  // Declare a new state variable, which we'll call "menu"
  const [menu, setMenu] = useState(false);

  const [username, setusername] = useState("Admin");

  useEffect(() => {
    if (localStorage.getItem("authUser")) {
        const obj = JSON.parse(localStorage.getItem("authUser"));
        setusername(obj?.displayName || "Admin");
    }
  }, [props.success]);

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="d-inline-block"
      >
        <DropdownToggle
          className="btn header-item bg-soft-light border-start border-end"
          id="page-header-user-dropdown"
          tag="button"
        >
          <img
            className="rounded-circle header-profile-user"
            src={user1}
            alt="Header Avatar"
          />
          <span className="d-none d-xl-inline-block ms-1 fw-medium">{username}</span>
          <i className="mdi mdi-chevron-down d-none d-xl-inline-block" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">



          <Link to="/view-audit" className="dropdown-item">
            <i className="mdi mdi-book-account font-size-16 align-middle me-1"></i>
            {props.t("Audit Logs")}
          </Link>

          <Link to="/auth/logout" className="dropdown-item">
            <i className="mdi mdi-lock font-size-16 align-middle me-1"></i>
            {props.t("Lock screen")}
          </Link>

          <div className="dropdown-divider" />
          <Link to="/auth/logout" className="dropdown-item">
            <i className="mdi mdi-logout font-size-16 align-middle me-1"></i>
            <span>{props.t("Logout")}</span>
          </Link>


        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

ProfileMenu.propTypes = {
  success: PropTypes.any,
  t: PropTypes.any
};

const mapStatetoProps = state => {
  const { error, success } = state.Profile;
  return { error, success };
};

export default
  connect(mapStatetoProps, {})(withTranslation()(ProfileMenu)
  );
