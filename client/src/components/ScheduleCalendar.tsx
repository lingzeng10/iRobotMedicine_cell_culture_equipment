import React, { useMemo } from 'react';
import { Box, Paper, Typography, Chip, Tooltip } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { ProductionScheduleRow } from '../types/target';

interface ScheduleCalendarProps {
  data: ProductionScheduleRow[];
  selectedDate?: Dayjs | null;
  onDateSelect?: (date: Dayjs | null) => void;
  onDateClick?: (date: string) => void; // 點擊日期時的回調（用於快速導航）
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  data,
  selectedDate,
  onDateSelect,
  onDateClick,
}) => {
  // 收集所有有排程的日期
  const scheduledDates = useMemo(() => {
    const dates = new Set<string>();
    data.forEach(row => {
      if (row.dates) {
        Object.keys(row.dates).forEach(date => {
          dates.add(date);
        });
      }
    });
    return dates;
  }, [data]);

  // 計算每個日期的排程數量
  const dateScheduleCount = useMemo(() => {
    const countMap = new Map<string, number>();
    data.forEach(row => {
      if (row.dates) {
        Object.keys(row.dates).forEach(date => {
          const currentCount = countMap.get(date) || 0;
          const dateData = row.dates?.[date];
          const schedules = dateData?.schedules || [];
          countMap.set(date, currentCount + schedules.length);
        });
      }
    });
    return countMap;
  }, [data]);

  // 檢查日期是否有排程
  const hasSchedule = (date: Dayjs): boolean => {
    const dateStr = date.format('YYYY-MM-DD');
    return scheduledDates.has(dateStr);
  };

  // 獲取日期的排程數量
  const getScheduleCount = (date: Dayjs): number => {
    const dateStr = date.format('YYYY-MM-DD');
    return dateScheduleCount.get(dateStr) || 0;
  };

  // 處理日期選擇
  const handleDateChange = (newDate: Dayjs | null) => {
    if (onDateSelect) {
      onDateSelect(newDate);
    }
    if (newDate && onDateClick) {
      onDateClick(newDate.format('YYYY-MM-DD'));
    }
  };

  // 自定義日曆日期的渲染
  const CustomDay = (props: any) => {
    const { day, ...other } = props;
    const isToday = dayjs().isSame(day, 'day');
    const hasSched = hasSchedule(day);
    const scheduleCount = getScheduleCount(day);
    const isSelected = selectedDate && dayjs(selectedDate).isSame(day, 'day');

    return (
      <Tooltip
        title={
          hasSched
            ? `${day.format('YYYY-MM-DD')} - ${scheduleCount} 個排程`
            : day.format('YYYY-MM-DD')
        }
        arrow
      >
        <Box sx={{ position: 'relative' }}>
          <PickersDay
            {...other}
            day={day}
            sx={{
              position: 'relative',
              backgroundColor: isSelected
                ? 'rgba(0, 212, 255, 0.3)'
                : isToday
                ? 'rgba(255, 248, 215, 0.2)'
                : 'transparent',
              border: isToday ? '2px solid #FFF8D7' : 'none',
              fontWeight: isToday ? 'bold' : hasSched ? 600 : 400,
              color: isToday
                ? '#FFF8D7'
                : hasSched
                ? '#00d4ff'
                : 'text.primary',
              textShadow: hasSched ? '0 0 4px rgba(0, 212, 255, 0.5)' : 'none',
              '&:hover': {
                backgroundColor: hasSched
                  ? 'rgba(0, 212, 255, 0.2)'
                  : 'rgba(0, 212, 255, 0.1)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 212, 255, 0.3)',
                color: '#00d4ff',
                fontWeight: 700,
                '&:hover': {
                  backgroundColor: 'rgba(0, 212, 255, 0.4)',
                },
              },
            }}
            onClick={() => handleDateChange(day)}
          />
          {hasSched && scheduleCount > 0 && (
            <Chip
              label={scheduleCount}
              size="small"
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                height: 16,
                minWidth: 16,
                fontSize: '0.65rem',
                backgroundColor: 'rgba(0, 212, 255, 0.3)',
                color: '#00d4ff',
                border: '1px solid rgba(0, 212, 255, 0.5)',
                pointerEvents: 'none',
                zIndex: 1,
                '& .MuiChip-label': {
                  padding: '0 4px',
                },
              }}
            />
          )}
        </Box>
      </Tooltip>
    );
  };

  return (
    <Paper
      sx={{
        p: 2,
        backgroundColor: 'background.paper',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0, 212, 255, 0.15)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          color: '#00d4ff',
          textShadow: '0 0 8px rgba(0, 212, 255, 0.3)',
          fontWeight: 700,
        }}
      >
        排程日曆
      </Typography>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={selectedDate}
            onChange={handleDateChange}
            sx={{
              '& .MuiPickersCalendarHeader-root': {
                color: '#00d4ff',
                '& .MuiPickersCalendarHeader-label': {
                  fontWeight: 600,
                  textShadow: '0 0 8px rgba(0, 212, 255, 0.3)',
                },
                '& .MuiIconButton-root': {
                  color: '#00d4ff',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  },
                },
              },
              '& .MuiDayCalendar-weekContainer': {
                '& .MuiPickersDay-root': {
                  color: 'text.primary',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 212, 255, 0.3)',
                    color: '#00d4ff',
                    fontWeight: 700,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 212, 255, 0.4)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  },
                },
              },
              '& .MuiDayCalendar-weekDayLabel': {
                color: '#a5b4fc',
                fontWeight: 600,
              },
            }}
            slots={{
              day: CustomDay,
            }}
          />
        </LocalizationProvider>
      </Box>

      {/* 圖例 */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0, 212, 255, 0.2)' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
          圖例：
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: 1,
                border: '2px solid #FFF8D7',
                backgroundColor: 'rgba(255, 248, 215, 0.2)',
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              今天
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: 1,
                backgroundColor: 'rgba(0, 212, 255, 0.2)',
                border: '1px solid rgba(0, 212, 255, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Chip
                label="1"
                size="small"
                sx={{
                  height: 12,
                  minWidth: 12,
                  fontSize: '0.6rem',
                  backgroundColor: 'rgba(0, 212, 255, 0.3)',
                  color: '#00d4ff',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              有排程（數字為排程數量）
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ScheduleCalendar;

