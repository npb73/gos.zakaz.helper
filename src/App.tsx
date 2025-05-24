import { AppShell, Text, Container, Title, Textarea, Button, Group, Paper, Loader, Card, Checkbox, Badge, Stack, Grid, Select, Modal, ActionIcon, useMantineColorScheme } from '@mantine/core'
import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import pdfFile from '../assets/rick_roll.pdf'
import { IconSun, IconMoon, IconSend } from '@tabler/icons-react'

interface CardItem {
  id: string
  description: string
  percentage: number
  checked: boolean
  price: number
}

type SortType = 'price-asc' | 'price-desc' | 'percentage-asc' | 'percentage-desc'

function App() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [cards, setCards] = useState<CardItem[]>([])
  const [viewedCount, setViewedCount] = useState(0)
  const [sortBy, setSortBy] = useState<SortType>('price-desc')
  const [isGeneratingMore, setIsGeneratingMore] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGeneratingTZ, setIsGeneratingTZ] = useState(false)
  const [tzFileUrl, setTzFileUrl] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const getPercentageColor = (percentage: number) => {
    if (percentage < 40) return 'red'
    if (percentage < 70) return 'yellow'
    return 'green'
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн ₽`
    }
    return `${(price / 1000).toFixed(0)} тыс ₽`
  }

  const generateCard = () => ({
    id: uuidv4(),
    description: 'Описание заказа',
    percentage: Math.floor(Math.random() * 101),
    checked: false,
    price: Math.floor(Math.random() * 9900000) + 100000
  })

  const addCardsWithDelay = (count: number) => {
    let currentIndex = 0
    
    const addNextCard = () => {
      if (currentIndex < count) {
        const delay = Math.floor(Math.random() * 12000) + 3000
        timeoutRef.current = setTimeout(() => {
          if (!isPaused) {
            const newCard = generateCard()
            setCards(prev => [...prev, newCard])
            const increment = Math.floor(Math.random() * 5) + 1
            setViewedCount(prev => prev + increment)
            currentIndex++
            addNextCard()
          }
        }, delay)
      } else {
        setIsLoading(false)
        setIsGeneratingMore(false)
      }
    }
    
    addNextCard()
  }

  const handleSubmit = () => {
    setIsLoading(true)
    setCards([])
    setViewedCount(0)
    setIsPaused(false)
    addCardsWithDelay(5)
  }

  const handleGenerateMore = () => {
    setIsGeneratingMore(true)
    setIsPaused(false)
    addCardsWithDelay(5)
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
    if (isPaused) {
      // Если разпаузили, продолжаем генерацию
      addCardsWithDelay(5 - cards.length)
    } else {
      // Если поставили на паузу, очищаем таймаут
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }

  const handleCheckboxChange = (id: string) => {
    setCards(prev => 
      prev.map(card => 
        card.id === id ? { ...card, checked: !card.checked } : card
      )
    )
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    document.title = 'САФТЗ'
  }, [])

  const sortedCards = [...cards].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'percentage-asc':
        return a.percentage - b.percentage
      case 'percentage-desc':
        return b.percentage - a.percentage
      default:
        return 0
    }
  })

  const handleGenerateTZ = () => {
    setIsModalOpen(true)
    setIsGeneratingTZ(true)
    setTzFileUrl(null)

    // Имитация генерации ТЗ
    setTimeout(() => {
      setIsGeneratingTZ(false)
      setTzFileUrl(pdfFile)
    }, 5000)
  }

  const getRecordWord = (count: number) => {
    const lastDigit = count % 10
    const lastTwoDigits = count % 100

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'записей'
    }

    if (lastDigit === 1) {
      return 'запись'
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'записи'
    }

    return 'записей'
  }

  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header>
        <Container size="lg" h="100%" display="flex" style={{ alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
          <Group gap="12px">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4L28 8V16C28 22.6274 22.6274 28 16 28C9.37258 28 4 22.6274 4 16C4 9.37258 9.37258 4 16 4Z" stroke="var(--mantine-color-blue-6)" strokeWidth="2"/>
              <path d="M16 12L22 14V18C22 20.2091 20.2091 22 18 22C15.7909 22 14 20.2091 14 18C14 15.7909 15.7909 14 18 14" stroke="var(--mantine-color-blue-6)" strokeWidth="2"/>
              <path d="M16 20L16 28" stroke="var(--mantine-color-blue-6)" strokeWidth="2"/>
            </svg>
            <Stack gap={0}>
              <Title order={2}>САФТЗ</Title>
              <Text size="sm" c="dimmed" visibleFrom="sm">Система Анализа и Формирования Технического Задания</Text>
            </Stack>
          </Group>
          <ActionIcon
            variant="default"
            size="lg"
            onClick={() => toggleColorScheme()}
            aria-label="Toggle color scheme"
          >
            {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
          </ActionIcon>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" py="xl">
          <Stack>
            <Paper shadow="sm" p="md" withBorder>
              <Group align="flex-start">
                <Textarea
                  placeholder="Введите ваш запрос..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ flex: 1 }}
                  size="lg"
                  autosize
                  minRows={1}
                  maxRows={10}
                />
                <Button 
                  size="lg" 
                  disabled={!query.trim() || isLoading || isGeneratingMore}
                  variant="filled"
                  onClick={handleSubmit}
                  visibleFrom="sm"
                >
                  Отправить
                </Button>
                <ActionIcon
                  size="lg"
                  variant="filled"
                  disabled={!query.trim() || isLoading || isGeneratingMore}
                  onClick={handleSubmit}
                  hiddenFrom="sm"
                >
                  <IconSend size={20} />
                </ActionIcon>
              </Group>
            </Paper>

            <Paper shadow="sm" p="md" withBorder>
              <Group justify="space-between">
                <Group>
                  <Text fw={500}>Сортировка:</Text>
                  <Select
                    value={sortBy}
                    onChange={(value) => setSortBy(value as SortType)}
                    data={[
                      { value: 'price-desc', label: 'Цена по убыванию' },
                      { value: 'price-asc', label: 'Цена по возрастанию' },
                      { value: 'percentage-desc', label: 'Процент по убыванию' },
                      { value: 'percentage-asc', label: 'Процент по возрастанию' },
                    ]}
                    style={{ width: 250 }}
                    disabled={!cards.length}
                  />
                </Group>
                <Button
                  variant="filled"
                  disabled={!cards.some(card => card.checked)}
                  onClick={handleGenerateTZ}
                >
                  Сформировать ТЗ
                </Button>
              </Group>
            </Paper>

            <Group justify="center" mt="xl" gap="md">
              {(isLoading || isGeneratingMore) ? (
                <>
                  {!isPaused && <Loader size="lg" />}
                  <Text size="lg">Просмотрено {viewedCount} {getRecordWord(viewedCount)}</Text>
                  <Button 
                    variant="light" 
                    color={isPaused ? 'green' : 'red'}
                    onClick={handlePause}
                  >
                    {isPaused ? 'Продолжить' : 'Пауза'}
                  </Button>
                </>
              ) : cards.length > 0 && (
                <Button 
                  size="lg" 
                  variant="light"
                  onClick={handleGenerateMore}
                >
                  Продолжить поиск
                </Button>
              )}
            </Group>

            <Grid mt="xl">
              {sortedCards.map((card) => (
                <Grid.Col key={card.id} span={{ base: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}>
                  <Card 
                    shadow="sm" 
                    p="lg" 
                    withBorder 
                    h="100%"
                    styles={{
                      root: {
                        borderColor: card.checked ? 'var(--mantine-color-blue-6)' : undefined,
                        transition: 'border-color 0.2s ease'
                      }
                    }}
                  >
                    <Stack>
                      <Group justify="space-between">
                        <Badge 
                          size="lg" 
                          variant="light"
                          color={getPercentageColor(card.percentage)}
                        >
                          {card.percentage}%
                        </Badge>
                        <Checkbox
                          checked={card.checked}
                          onChange={() => handleCheckboxChange(card.id)}
                        />
                      </Group>
                      <Stack gap="xs">
                        <Title order={3}>
                          {formatPrice(card.price)}
                        </Title>
                        <Text>{card.description}</Text>
                        <Button variant="subtle" size="sm" fullWidth>
                          Перейти
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        </Container>
      </AppShell.Main>

      <Modal 
        opened={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Формирование технического задания"
        centered
      >
        <Stack align="center" py="xl">
          {isGeneratingTZ ? (
            <>
              <Loader size="xl" />
              <Text>Формирование ТЗ...</Text>
            </>
          ) : tzFileUrl && (
            <>
              <Text>ТЗ успешно сформировано</Text>
              <Button 
                component="a" 
                href={tzFileUrl} 
                target="_blank"
                variant="light"
              >
                Открыть PDF
              </Button>
            </>
          )}
        </Stack>
      </Modal>
    </AppShell>
  )
}

export default App 