import { Menu, MenuButton, Button, MenuList, MenuItem } from "@chakra-ui/react";
import { BsChevronDown } from "react-icons/bs";

const SortSelector = () => {
  return (
    <Menu>
      <MenuButton marginLeft={2} as={Button} rightIcon={<BsChevronDown />}>
        Order By: Rating
      </MenuButton>
      <MenuList>
        <MenuItem>Name</MenuItem>
        <MenuItem>Installs</MenuItem>
        <MenuItem>Relevance</MenuItem>
        <MenuItem>Rating</MenuItem>
        <MenuItem>Release Date</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default SortSelector;
