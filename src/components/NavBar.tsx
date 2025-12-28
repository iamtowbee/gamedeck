import { HStack, Image, Button } from "@chakra-ui/react";
import logo from "../assets/logo.svg";
import ColorModeSwitch from "./ColorModeSwitch";
import SearchInput from "./SearchInput";

interface Props {
  onToggleView?: () => void;
}

const NavBar = ({ onToggleView }: Props) => {
  return (
    <HStack justifyContent="space-between" marginX={5} py={5}>
      <Image src={logo} boxSize="60px" />
      <SearchInput />
      {onToggleView && (
        <Button onClick={onToggleView} colorScheme="purple" size="sm">
          XMB Menu
        </Button>
      )}
      <ColorModeSwitch />
    </HStack>
  );
};

export default NavBar;
