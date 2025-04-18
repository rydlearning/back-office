import PropTypes from 'prop-types';
import React, { useState } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

//Import Icons
import FeatherIcon from "feather-icons-react";

// Reactstrap
import { Dropdown, DropdownToggle, DropdownMenu, Row, Col } from "reactstrap";

// Import menuDropdown
import LanguageDropdown from "../CommonForBoth/TopbarDropdown/LanguageDropdown";
import NotificationDropdown from "../CommonForBoth/TopbarDropdown/NotificationDropdown";
import ProfileMenu from "../CommonForBoth/TopbarDropdown/ProfileMenu";
import LightDark from "../CommonForBoth/Menus/LightDark";

// import images
import logoSvg from "../../assets/images/favicon.png";
import github from "../../assets/images/brands/github.png";
import bitbucket from "../../assets/images/brands/bitbucket.png";
import dribbble from "../../assets/images/brands/dribbble.png";
import dropbox from "../../assets/images/brands/dropbox.png";
import mail_chimp from "../../assets/images/brands/mail_chimp.png";
import slack from "../../assets/images/brands/slack.png";

//i18n
import { withTranslation } from "react-i18next";
//redux
import { useSelector, useDispatch } from "react-redux";

// Redux Store
import {
  showRightSidebarAction,
  toggleLeftmenu,
  changeSidebarType,
  changelayoutMode
} from "../../store/actions";
import { createSelector } from 'reselect';

const Header = props => {
  const dispatch = useDispatch();

  const headerData = createSelector(
    (state) => state.Layout,
    (layout) => ({
      showRightSidebar: layout.showRightSide
    })
  );
  // Inside your component
  const { showRightSidebar } = useSelector(headerData);

  const { onChangeLayoutMode } = props;
  const [search, setsearch] = useState(false);
  const [socialDrp, setsocialDrp] = useState(false);
  const [isClick, setClick] = useState(true);

  /*** Sidebar menu icon and default menu set */
  function tToggle() {
    var body = document.body;
    setClick(!isClick);
    if (isClick === true) {
      body.classList.remove("sidebar-enable");
      document.body.setAttribute("data-sidebar-size", "sm");
    } else {
      body.classList.add("sidebar-enable");
      document.body.setAttribute("data-sidebar-size", "lg");
    }
  }

  return (
    <React.Fragment>
      <header id="page-topbar">
        <div className="navbar-header">
          <div className="d-flex">
            <div className="navbar-brand-box">
              <Link to="/dashboard" className="logo logo-dark">
                <span className="logo-sm">
                  <img src={logoSvg} alt="" height="24" />
                </span>
                <span className="logo-lg">
                  <img src={logoSvg} alt="" height="24" /> <span className="logo-txt">RYD Admin</span>
                </span>
              </Link>

              <Link to="/dashboard" className="logo logo-light">
                <span className="logo-sm">
                  <img src={logoSvg} alt="" height="24" />
                </span>
                <span className="logo-lg">
                  <img src={logoSvg} alt="" height="24" /> <span className="logo-txt">RYD Admin</span>
                </span>
              </Link>
            </div>

            <button
              onClick={() => {
                tToggle();
              }}
              type="button" className="btn btn-sm px-3 font-size-16 header-item" id="vertical-menu-btn">
              <i className="fa fa-fw fa-bars"></i>
            </button>

            <form className="app-search d-none d-lg-block" method={'get'} action={'/manage-parent/edit'}>
              <div className="position-relative">
                <input disabled={true} required={true} name={'email'} type="text" className="form-control" placeholder="Search in system..." />
                <button disabled={true} className="btn btn-primary" type="submit"><i className="bx bx-search-alt align-middle"></i></button>
              </div>
            </form>
          </div>

          <div className="d-flex">

            <LanguageDropdown />

            {/* light / dark mode */}
            <LightDark layoutMode={props['layoutMode']} onChangeLayoutMode={onChangeLayoutMode} />



            <ProfileMenu />

          </div>
        </div>
      </header>

    </React.Fragment>
  );
};

Header.propTypes = {
  changeSidebarType: PropTypes.func,
  leftMenu: PropTypes.any,
  showRightSidebar: PropTypes.any,
  showRightSidebarAction: PropTypes.func,
  t: PropTypes.any,
  toggleLeftmenu: PropTypes.func,
  changelayoutMode: PropTypes.func,
  layoutMode: PropTypes.any,
};

const mapStatetoProps = state => {
  const {
    layoutType,
    showRightSidebar,
    leftMenu,
    layoutMode
  } = state.Layout;
  return { layoutType, showRightSidebar, leftMenu, layoutMode };
};

export default connect(mapStatetoProps, {
  showRightSidebarAction,
  changelayoutMode,
  toggleLeftmenu,
  changeSidebarType,
})(withTranslation()(Header));
