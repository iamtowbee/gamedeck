import {
  ComponentWithAs,
  Flex,
  Icon,
  Switch,
  useColorMode,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

const ColorModeSwitch = () => {
  const { toggleColorMode, colorMode } = useColorMode();
  const iconMap: { [key: string]: ComponentWithAs<"svg"> } = {
    light: SunIcon,
    dark: MoonIcon,
  };
  return (
    <Flex
      marginEnd={0}
      direction={["column-reverse", "column-reverse", "row"]}
      alignItems="center"
      gap={1.5}
    >
      <Switch
        colorScheme="whiteAlpha"
        isChecked={colorMode === "dark"}
        onChange={toggleColorMode}
      />
      <Icon
        as={iconMap[colorMode]}
        color="gray.500"
        key={Math.round(Math.random())}
        boxSize={5}
      />
    </Flex>
  );
};

export default ColorModeSwitch;
