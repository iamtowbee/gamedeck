import {
  Card,
  CardBody,
  Flex,
  HStack,
  Heading,
  Image,
  Img,
  Spacer,
} from "@chakra-ui/react";
import { Game } from "../hooks/useGames";
import PlatformIconList from "./PlatformIconList";
import CriticScore from "./CriticScore";
import getCroppedImageUrl from "../services/image-url";

interface Props {
  game: Game;
}

const GameCard = ({ game }: Props) => {
  return (
    <Card height="full">
      <Image
        src={getCroppedImageUrl(game.background_image)}
        fallback={<Img />}
      />
      <CardBody>
        <Flex height="full" direction="column" justifyContent="space-between">
          <Heading fontSize="2xl">{game.name}</Heading>
          <Spacer />
          <HStack justifyContent="space-between">
            <PlatformIconList
              platforms={game.parent_platforms.map((plat) => plat.platform)}
            />
            <CriticScore score={game.metacritic} />
          </HStack>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default GameCard;
