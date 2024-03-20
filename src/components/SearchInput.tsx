import { Input } from "@chakra-ui/react";

const SearchInput = () => {
  return (
    <Input
      borderRadius={10}
      placeholder="Search games..."
      variant="filled"
      maxW={{
        sm: "100%",
        md: "60vw",
        lg: "48.5vw",
        // xl: 5,
      }}
      py={5}
    />
  );
};

export default SearchInput;
