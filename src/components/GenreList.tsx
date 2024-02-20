import {
  Box,
  Button,
  HStack,
  Image,
  List,
  ListItem,
  SkeletonCircle,
  SkeletonText,
  Tooltip,
} from "@chakra-ui/react";
import useGenres, { Genre } from "../hooks/useGenres";
import getCroppedImageUrl from "../services/image-url";
import { RiArrowRightDoubleLine } from "react-icons/ri";
import { useState } from "react";

interface Props {
  onSelectGenre: (genre: Genre) => void;
  selectedGenre: Genre | null;
}

const GenreList = ({ onSelectGenre, selectedGenre }: Props) => {
  const { data: genres, isLoading, error } = useGenres();
  const [hoveredGenreId, setHoveredGenreId] = useState<number | null>(null);

  // let skeletons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  if (error) return;

  if (isLoading)
    return (
      <List>
        {Array(15)
          .fill(" ")
          .map((_, i) => (
            <ListItem key={i} paddingY={1.5} marginY={1}>
              {/* <Skeleton> */}
              <Box display="flex" alignItems="center">
                <SkeletonCircle size="10" />
                <SkeletonText
                  ml="3"
                  noOfLines={2}
                  spacing="1.5"
                  skeletonHeight="2"
                  width="50%"
                />
              </Box>
              {/* </Skeleton> */}
            </ListItem>
          ))}
      </List>
    );

  return (
    <List>
      {genres.map((genre) => (
        <ListItem key={genre.id} paddingY={1.5}>
          <HStack>
            <Image
              boxSize="32px"
              borderRadius="8px"
              src={getCroppedImageUrl(genre.image_background)}
            />
            <Box isTruncated={genre.name.length > 12}>
              <Tooltip hasArrow label={genre.name} placement="top">
                <Button
                  fontSize="lg"
                  variant="link"
                  fontWeight={
                    genre.id === selectedGenre?.id ? "bold" : "normal"
                  }
                  onMouseEnter={() => setHoveredGenreId(genre.id)}
                  onMouseLeave={() => setHoveredGenreId(null)}
                  onClick={() => onSelectGenre(genre)}
                  className="align-end truncate"
                >
                  {genre.name}
                  {hoveredGenreId === genre.id ? (
                    <RiArrowRightDoubleLine />
                  ) : null}
                </Button>
              </Tooltip>
            </Box>
          </HStack>
        </ListItem>
      ))}
    </List>
  );
};

export default GenreList;
