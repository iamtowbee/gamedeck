import { Box, Heading, Text, VStack, HStack, Badge, Image } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import useDailyGames from '../hooks/useDailyGames';
import { MENU_CATEGORIES } from '../types/daily-menu';
import {
  addGameToToday,
  getTodayGames,
  getStreakDays,
  getPlayedGamesCount,
} from '../utils/daily-game-storage';
import getCroppedImageUrl from '../services/image-url';
import noImage from '../assets/no-image-placeholder.jpg';

const MotionBox = motion(Box);

const DailyGameMenuCarousel = () => {
  const { games, isLoading } = useDailyGames();
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [gameIndex, setGameIndex] = useState(0);
  const [playedToday, setPlayedToday] = useState<number[]>([]);

  useEffect(() => {
    // Load today's played games
    const todayGames = getTodayGames();
    setPlayedToday(todayGames.map(g => g.gameId));
  }, []);

  // Navigation handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentCategory = MENU_CATEGORIES[categoryIndex];
      const currentGames = games[currentCategory.id as keyof typeof games];

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCategoryIndex(prev => (prev > 0 ? prev - 1 : MENU_CATEGORIES.length - 1));
          setGameIndex(0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCategoryIndex(prev => (prev < MENU_CATEGORIES.length - 1 ? prev + 1 : 0));
          setGameIndex(0);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setGameIndex(prev => (prev > 0 ? prev - 1 : currentGames.length - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setGameIndex(prev => (prev < currentGames.length - 1 ? prev + 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          handleSelectGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [categoryIndex, gameIndex, games]);

  const handleSelectGame = () => {
    const currentCategory = MENU_CATEGORIES[categoryIndex];
    const currentGames = games[currentCategory.id as keyof typeof games];
    const selectedGame = currentGames[gameIndex];

    if (selectedGame && !playedToday.includes(selectedGame.id)) {
      addGameToToday(selectedGame.id, selectedGame.name);
      setPlayedToday(prev => [...prev, selectedGame.id]);
    }
  };

  const currentCategory = MENU_CATEGORIES[categoryIndex];
  const currentGames = games[currentCategory.id as keyof typeof games];
  const selectedGame = currentGames[gameIndex];

  if (isLoading) {
    return (
      <Box
        minH="100vh"
        bg="linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <MotionBox
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Text fontSize="2xl" color="white">
              Loading...
            </Text>
          </MotionBox>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" overflow="hidden">
      {/* Stats Bar */}
      <HStack
        position="absolute"
        top={4}
        right={8}
        spacing={6}
        zIndex={10}
        bg="rgba(0,0,0,0.5)"
        px={6}
        py={3}
        borderRadius="md"
        backdropFilter="blur(10px)"
      >
        <VStack spacing={0} align="center">
          <Text fontSize="xs" color="gray.400">
            STREAK
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="#00A8E1">
            {getStreakDays()}
          </Text>
        </VStack>
        <VStack spacing={0} align="center">
          <Text fontSize="xs" color="gray.400">
            TOTAL
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="#FFD700">
            {getPlayedGamesCount()}
          </Text>
        </VStack>
        <VStack spacing={0} align="center">
          <Text fontSize="xs" color="gray.400">
            TODAY
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="#4ECDC4">
            {playedToday.length}
          </Text>
        </VStack>
      </HStack>

      {/* Background Image */}
      <AnimatePresence mode="wait">
        {selectedGame && (
          <MotionBox
            key={selectedGame.id}
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={selectedGame.background_image || noImage}
              alt={selectedGame.name}
              w="100%"
              h="100%"
              objectFit="cover"
              filter="blur(20px)"
            />
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="linear-gradient(135deg, rgba(26,26,46,0.8) 0%, rgba(22,33,62,0.9) 100%)"
            />
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <VStack h="100vh" justify="center" align="center" spacing={8} position="relative" zIndex={1}>
        {/* Category Navigation */}
        <HStack spacing={8} mb={8}>
          {MENU_CATEGORIES.map((category, index) => (
            <MotionBox
              key={category.id}
              animate={{
                scale: categoryIndex === index ? 1.2 : 1,
                opacity: categoryIndex === index ? 1 : 0.5,
              }}
              transition={{ duration: 0.3 }}
            >
              <VStack spacing={2}>
                <Box
                  w="60px"
                  h="60px"
                  borderRadius="full"
                  bg={categoryIndex === index ? category.color : 'gray.700'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow={categoryIndex === index ? `0 0 20px ${category.color}` : 'none'}
                  transition="all 0.3s"
                />
                <Text
                  fontSize="xs"
                  fontWeight={categoryIndex === index ? 'bold' : 'normal'}
                  color={categoryIndex === index ? 'white' : 'gray.500'}
                  textAlign="center"
                >
                  {category.title}
                </Text>
              </VStack>
            </MotionBox>
          ))}
        </HStack>

        {/* Game Cards Carousel */}
        <Box w="80%" maxW="1200px" position="relative">
          <AnimatePresence mode="wait">
            {selectedGame && (
              <MotionBox
                key={selectedGame.id}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <VStack spacing={6} align="center">
                  {/* Game Image */}
                  <Box
                    position="relative"
                    borderRadius="xl"
                    overflow="hidden"
                    boxShadow="0 20px 60px rgba(0,0,0,0.5)"
                    border="4px solid"
                    borderColor={currentCategory.color}
                  >
                    <Image
                      src={getCroppedImageUrl(selectedGame.background_image) || noImage}
                      alt={selectedGame.name}
                      w="600px"
                      h="400px"
                      objectFit="cover"
                    />
                    {playedToday.includes(selectedGame.id) && (
                      <Badge
                        position="absolute"
                        top={4}
                        right={4}
                        colorScheme="green"
                        fontSize="md"
                        px={3}
                        py={1}
                      >
                        ✓ PLAYED
                      </Badge>
                    )}
                  </Box>

                  {/* Game Info */}
                  <VStack spacing={3} align="center" maxW="600px">
                    <Heading size="xl" color="white" textAlign="center">
                      {selectedGame.name}
                    </Heading>
                    {selectedGame.metacritic && (
                      <Badge
                        colorScheme={selectedGame.metacritic > 80 ? 'green' : 'yellow'}
                        fontSize="lg"
                        px={3}
                        py={1}
                      >
                        {selectedGame.metacritic}
                      </Badge>
                    )}
                    <Text fontSize="sm" color="gray.400" textAlign="center">
                      Press ENTER to mark as played • Arrow keys to navigate
                    </Text>
                  </VStack>
                </VStack>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Game Counter */}
          {currentGames.length > 0 && (
            <HStack
              position="absolute"
              bottom={-12}
              left="50%"
              transform="translateX(-50%)"
              spacing={2}
            >
              {currentGames.map((_, index) => (
                <Box
                  key={index}
                  w={gameIndex === index ? '24px' : '8px'}
                  h="8px"
                  borderRadius="full"
                  bg={gameIndex === index ? currentCategory.color : 'gray.600'}
                  transition="all 0.3s"
                />
              ))}
            </HStack>
          )}
        </Box>

        {/* Navigation Hints */}
        <HStack
          position="absolute"
          bottom={8}
          spacing={8}
          fontSize="sm"
          color="gray.500"
          bg="rgba(0,0,0,0.3)"
          px={6}
          py={3}
          borderRadius="md"
          backdropFilter="blur(10px)"
        >
          <Text>← → Category</Text>
          <Text>↑ ↓ Game</Text>
          <Text>ENTER Select</Text>
        </HStack>
      </VStack>
    </Box>
  );
};

export default DailyGameMenuCarousel;
