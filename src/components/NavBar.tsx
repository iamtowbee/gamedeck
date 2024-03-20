import { HStack, Image } from "@chakra-ui/react";
import logo from "../assets/logo.svg";
import ColorModeSwitch from "./ColorModeSwitch";
import SearchInput from "./SearchInput";

const NavBar = () => {
  return (
    <HStack justifyContent="space-between" marginX={5} py={5}>
      <Image src={logo} boxSize="60px" />
      <SearchInput />
      <ColorModeSwitch />
    </HStack>
  );
};

export default NavBar;
