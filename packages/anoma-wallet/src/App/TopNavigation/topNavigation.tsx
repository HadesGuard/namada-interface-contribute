import React, { useState, useContext } from "react";
import { ThemeContext } from "styled-components";
import { useNavigate, useLocation, NavigateFunction } from "react-router-dom";
import { Persistor } from "redux-persist";
import { Provider } from "react-redux";

import { TopLevelRoute } from "App/types";
import { Image, ImageName } from "components/Image";
import { Toggle } from "components/Toggle";
import {
  TopNavigationContainer,
  LeftSection,
  MiddleSection,
  RightSection,
  MenuItem,
  MenuItemTextContainer,
  ColorModeContainer,
  LogoContainer,
  OnlyInSmall,
  OnlyInMedium,
  TopNavigationContainerRow,
  TopNavigationContainerSecondRow,
  TopNavigationLogoContainer,
  MenuButton,
  MobileMenu,
  MobileMenuList,
  MobileMenuListItem,
  MobileMenuHeader,
  MenuCloseButton,
} from "./topNavigation.components";

import { AppStore } from "store/store";
import TopNavigationLoggedIn from "./topNavigationLoggedIn";
import { SettingsButton } from "./topNavigationLoggedIn.components";
import { Icon, IconName } from "components/Icon";

/**
 * this is rendered in one of 2 places depending of the screen size
 */
const TopNavigationMenuItems = (props: {
  navigate: NavigateFunction;
}): React.ReactElement => {
  const { navigate } = props;
  const location = useLocation();

  return (
    <>
      {/* Wallet */}
      <MenuItem
        onClick={() => {
          navigate(`${TopLevelRoute.Wallet}`);
        }}
        isSelected={location.pathname === TopLevelRoute.Wallet}
      >
        <MenuItemTextContainer>Wallet</MenuItemTextContainer>
      </MenuItem>

      {/* Bridge */}
      <MenuItem
        onClick={() => {
          navigate(`${TopLevelRoute.Bridge}`);
        }}
        isSelected={location.pathname === TopLevelRoute.Bridge}
      >
        <MenuItemTextContainer>Bridge</MenuItemTextContainer>
      </MenuItem>

      {/* Staking */}
      <MenuItem
        isSelected={location.pathname === TopLevelRoute.StakingAndGovernance}
      >
        <MenuItemTextContainer>Staking</MenuItemTextContainer>
      </MenuItem>

      {/* Governance */}
      <MenuItem
        isSelected={location.pathname === TopLevelRoute.StakingAndGovernance}
      >
        <MenuItemTextContainer>Governance</MenuItemTextContainer>
      </MenuItem>
    </>
  );
};

type TopNavigationProps = {
  // this is for the toggle
  isLightMode: boolean;
  // cb for telling parent to change hte color in context
  setIsLightMode: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggedIn?: boolean;
  persistor?: Persistor;
  store?: AppStore;
  logout: () => void;
};
// top nav of the app, this is likely always visible.
function TopNavigation(props: TopNavigationProps): JSX.Element {
  const {
    isLightMode,
    logout,
    setIsLightMode,
    isLoggedIn = false,
    store,
  } = props;
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <TopNavigationContainer>
      <OnlyInMedium>
        <TopNavigationContainerRow>
          <LeftSection>
            &nbsp;
            {isLoggedIn && (
              <LogoContainer
                onClick={() => {
                  navigate(TopLevelRoute.Home);
                }}
              >
                <Image
                  imageName={ImageName.Logo}
                  styleOverrides={{ maxWidth: "200px" }}
                  forceLightMode={true}
                />
              </LogoContainer>
            )}
          </LeftSection>

          <MiddleSection>
            {isLoggedIn && <TopNavigationMenuItems navigate={navigate} />}
          </MiddleSection>

          <RightSection>
            {/* TODO: extract to Button component*/}
            {isLoggedIn && (
              <MenuItem
                onClick={() => {
                  navigate(TopLevelRoute.Home);
                  logout();
                }}
              >
                <Icon iconName={IconName.Lock} />
                <MenuItemTextContainer>Lock</MenuItemTextContainer>
              </MenuItem>
            )}
          </RightSection>
        </TopNavigationContainerRow>
        <TopNavigationContainerSecondRow>
          {isLoggedIn && store && (
            <Provider store={store}>
              <TopNavigationLoggedIn
                isLightMode={isLightMode}
                setIsLightMode={(isLightMode) => setIsLightMode(isLightMode)}
              ></TopNavigationLoggedIn>
            </Provider>
          )}
          {!isLoggedIn && (
            <TopNavigationLogoContainer>
              <SettingsButton>
                <Icon iconName={IconName.Settings} />
              </SettingsButton>
              <LogoContainer
                onClick={() => {
                  navigate(TopLevelRoute.Home);
                }}
              >
                <Image
                  imageName={ImageName.Logo}
                  styleOverrides={{ maxWidth: "300px" }}
                />
              </LogoContainer>
              <ColorModeContainer>
                <Toggle
                  checked={isLightMode}
                  onClick={() => {
                    setIsLightMode((isLightMode) => !isLightMode);
                  }}
                />
              </ColorModeContainer>
            </TopNavigationLogoContainer>
          )}
        </TopNavigationContainerSecondRow>
      </OnlyInMedium>
      <OnlyInSmall>
        <TopNavigationContainerRow>
          &nbsp;
          {isLoggedIn && (
            <>
              <LeftSection>
                <MenuButton onClick={() => setShowMenu(true)}>
                  <Icon
                    iconName={IconName.Menu}
                    strokeColorOverride={themeContext.colors.primary.main60}
                    fillColorOverride={themeContext.colors.primary.main60}
                  />
                </MenuButton>
              </LeftSection>
              <MiddleSection>
                <LogoContainer
                  onClick={() => {
                    navigate(TopLevelRoute.Home);
                  }}
                >
                  <Image
                    imageName={ImageName.Logo}
                    styleOverrides={{ maxWidth: "200px" }}
                    forceLightMode={true}
                  />
                </LogoContainer>
              </MiddleSection>
              <RightSection>
                {isLoggedIn && (
                  <ColorModeContainer>
                    <Toggle
                      checked={isLightMode}
                      onClick={() => {
                        setIsLightMode((isLightMode) => !isLightMode);
                      }}
                    />
                  </ColorModeContainer>
                )}
              </RightSection>
            </>
          )}
        </TopNavigationContainerRow>
        <TopNavigationContainerSecondRow>
          {isLoggedIn && store ? (
            <Provider store={store}>
              <TopNavigationLoggedIn
                isLightMode={isLightMode}
                setIsLightMode={(isLightMode) => setIsLightMode(isLightMode)}
              ></TopNavigationLoggedIn>
            </Provider>
          ) : (
            <TopNavigationLogoContainer>
              <SettingsButton>
                <Icon iconName={IconName.Settings} />
              </SettingsButton>
              <LogoContainer
                onClick={() => {
                  navigate(TopLevelRoute.Home);
                }}
              >
                <Image
                  imageName={ImageName.Logo}
                  styleOverrides={{ maxWidth: "300px" }}
                />
              </LogoContainer>
              <ColorModeContainer>
                <Toggle
                  checked={isLightMode}
                  onClick={() => {
                    setIsLightMode((isLightMode) => !isLightMode);
                  }}
                />
              </ColorModeContainer>
            </TopNavigationLogoContainer>
          )}
        </TopNavigationContainerSecondRow>
        <MobileMenu className={showMenu ? "active" : ""}>
          <MobileMenuHeader>
            <MenuCloseButton onClick={() => setShowMenu(false)}>
              <Icon
                iconName={IconName.ChevronLeft}
                strokeColorOverride={themeContext.colors.utility2.main60}
              />
            </MenuCloseButton>
            <LogoContainer
              onClick={() => {
                navigate(TopLevelRoute.Home);
              }}
            >
              <Image
                imageName={ImageName.Logo}
                styleOverrides={{ maxWidth: "200px" }}
                forceLightMode={true}
              />
            </LogoContainer>
            <ColorModeContainer>
              <Toggle
                checked={isLightMode}
                onClick={() => {
                  setIsLightMode((isLightMode) => !isLightMode);
                }}
              />
            </ColorModeContainer>
          </MobileMenuHeader>

          <MobileMenuList>
            <MobileMenuListItem>
              <MenuItem
                onClick={() => {
                  setShowMenu(false);
                  navigate(TopLevelRoute.Home);
                }}
              >
                Wallet
              </MenuItem>
            </MobileMenuListItem>
            <MobileMenuListItem>
              <MenuItem
                onClick={() => {
                  setShowMenu(false);
                  navigate(TopLevelRoute.Bridge);
                }}
              >
                Bridge
              </MenuItem>
            </MobileMenuListItem>
            <MobileMenuListItem>
              <MenuItem
                onClick={() => {
                  setShowMenu(false);
                  navigate(TopLevelRoute.Settings);
                }}
              >
                Settings
              </MenuItem>
            </MobileMenuListItem>
            <MobileMenuListItem>
              <MenuItem
                onClick={() => {
                  setShowMenu(false);
                  navigate(TopLevelRoute.Home);
                  logout();
                }}
              >
                <Icon iconName={IconName.Lock} />
                <MenuItemTextContainer>Lock</MenuItemTextContainer>
              </MenuItem>
            </MobileMenuListItem>
          </MobileMenuList>
        </MobileMenu>
      </OnlyInSmall>
    </TopNavigationContainer>
  );
}

export default TopNavigation;
