import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  availableCapacity: number;
  totalCapacity: number;
  priceMultiplier: number;
  status: string;
}

interface SlotCalendarProps {
  zoneId: string;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedSlotId?: string;
}

const SlotCalendar: React.FC<SlotCalendarProps> = ({
  zoneId,
  onSlotSelect,
  selectedSlotId,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  // Generate dates for the week
  const getWeekDates = (startDate: Date) => {
    const dates = [];
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentDate);

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get capacity color
  const getCapacityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'success';
    if (percentage > 20) return 'warning';
    return 'error';
  };

  // Get capacity text
  const getCapacityText = (available: number, total: number) => {
    if (available === 0) return 'Full';
    if (available === total) return 'Available';
    return `${available} left`;
  };

  // Mock data - In real app, fetch from API based on zoneId and date range
  React.useEffect(() => {
    setLoading(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      const mockSlots: TimeSlot[] = [];
      
      weekDates.forEach((date) => {
        const dateStr = date.toISOString().split('T')[0];
        
        // Generate slots for 9 AM - 5 PM
        for (let hour = 9; hour < 17; hour++) {
          const startTime = `${hour.toString().padStart(2, '0')}:00:00`;
          const endTime = `${(hour + 1).toString().padStart(2, '0')}:00:00`;
          
          mockSlots.push({
            id: `slot-${dateStr}-${hour}`,
            date: dateStr,
            startTime,
            endTime,
            availableCapacity: Math.floor(Math.random() * 10),
            totalCapacity: 10,
            priceMultiplier: hour >= 12 && hour < 14 ? 1.2 : 1.0,
            status: 'active',
          });
        }
      });

      setSlots(mockSlots);
      setLoading(false);
    }, 500);
  }, [currentDate, zoneId]);

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Select Delivery Time</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={goToPreviousWeek} size="small">
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
              {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
            </Typography>
            <IconButton onClick={goToNextWeek} size="small">
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {weekDates.map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const dateSlots = slotsByDate[dateStr] || [];
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <Grid item xs={12} key={dateStr}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: isPast ? 'text.disabled' : 'text.primary',
                  }}
                >
                  {formatDate(date)}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {dateSlots.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No slots available
                    </Typography>
                  ) : (
                    dateSlots.map((slot) => {
                      const isSelected = slot.id === selectedSlotId;
                      const isAvailable = slot.availableCapacity > 0 && !isPast;
                      const isPeakTime = slot.priceMultiplier > 1.0;

                      return (
                        <Tooltip
                          key={slot.id}
                          title={
                            !isAvailable
                              ? 'Not available'
                              : isPeakTime
                              ? `Peak time (+${((slot.priceMultiplier - 1) * 100).toFixed(0)}%)`
                              : 'Standard rate'
                          }
                        >
                          <span>
                            <Button
                              variant={isSelected ? 'contained' : 'outlined'}
                              size="small"
                              disabled={!isAvailable}
                              onClick={() => onSlotSelect(slot)}
                              startIcon={
                                isSelected ? (
                                  <CheckCircleIcon />
                                ) : (
                                  <AccessTimeIcon />
                                )
                              }
                              sx={{
                                minWidth: 140,
                                justifyContent: 'flex-start',
                                borderColor: isPeakTime ? 'warning.main' : undefined,
                              }}
                            >
                              <Box sx={{ textAlign: 'left', flex: 1 }}>
                                <Typography variant="body2" component="div">
                                  {formatTime(slot.startTime)}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  component="div"
                                  color={
                                    isAvailable
                                      ? getCapacityColor(
                                          slot.availableCapacity,
                                          slot.totalCapacity
                                        )
                                      : 'text.disabled'
                                  }
                                >
                                  {getCapacityText(
                                    slot.availableCapacity,
                                    slot.totalCapacity
                                  )}
                                </Typography>
                              </Box>
                              {isPeakTime && (
                                <Chip
                                  label="Peak"
                                  size="small"
                                  color="warning"
                                  sx={{ ml: 1, height: 20 }}
                                />
                              )}
                            </Button>
                          </span>
                        </Tooltip>
                      );
                    })
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: 'success.main',
              }}
            />
            <Typography variant="caption">Available</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: 'warning.main',
              }}
            />
            <Typography variant="caption">Limited</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: 'error.main',
              }}
            />
            <Typography variant="caption">Almost Full</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label="Peak" size="small" color="warning" sx={{ height: 20 }} />
            <Typography variant="caption">Peak time pricing</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SlotCalendar;

// Made with Bob
