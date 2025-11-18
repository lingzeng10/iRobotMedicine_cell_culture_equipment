import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Chip,
  Tooltip,
  Collapse,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { ProductionScheduleRow, TicketScheduleWithRelations } from '../types/target';
import { getTicketName, getStatusText, getStatusColor, getStatusCustomColor } from '../utils/stationMapping';
import CustomCalendarIcon from './CustomCalendarIcon';

interface ProductionScheduleTableProps {
  data: ProductionScheduleRow[];
  dateColumns?: string[]; // 可選的日期欄位列表
  selectedYear?: number; // 選擇的年份
  selectedMonth?: number; // 選擇的月份（1-12）
  onDateClick?: (targetId: string, date: string) => void; // 點擊日期時的回調（新增排程）
  onScheduleClick?: (schedule: TicketScheduleWithRelations) => void; // 點擊工單排程時的回調（查看詳情）
  onScheduleEdit?: (schedule: TicketScheduleWithRelations) => void; // 編輯工單排程時的回調
  onScheduleDelete?: (scheduleId: string) => void; // 刪除工單排程時的回調
  onTargetEdit?: (targetId: string) => void; // 編輯生產目標時的回調
  onTargetDelete?: (targetId: string) => void; // 刪除生產目標時的回調
}

type SortField = 'cellName' | 'productionTarget' | 'actualProduction' | 'startCultureDate' | 'generation' | 'boxCount';
type SortOrder = 'asc' | 'desc';

const ProductionScheduleTable: React.FC<ProductionScheduleTableProps> = ({
  data,
  dateColumns = [],
  selectedYear,
  selectedMonth,
  onDateClick,
  onScheduleClick,
  onScheduleEdit,
  onScheduleDelete,
  onTargetEdit,
  onTargetDelete,
}) => {
  const [sortField, setSortField] = useState<SortField>('startCultureDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set()); // 展開的日期單元格

  // 排序邏輯
  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // 處理不同類型的排序
      if (sortField === 'startCultureDate') {
        aValue = dayjs(aValue).valueOf();
        bValue = dayjs(bValue).valueOf();
      } else if (sortField === 'actualProduction' || sortField === 'productionTarget') {
        // 對於 "1L", "3L" 等格式，提取數字進行排序
        const aNum = parseInt(aValue?.replace(/[^0-9]/g, '') || '0');
        const bNum = parseInt(bValue?.replace(/[^0-9]/g, '') || '0');
        aValue = aNum;
        bValue = bNum;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortField, sortOrder]);

  // 處理排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 生成日期欄位
  const generateDateColumns = () => {
    // 如果提供了年月，根據年月生成該月的所有日期
    if (selectedYear && selectedMonth) {
      const year = selectedYear;
      const month = selectedMonth - 1; // dayjs 月份從 0 開始
      const daysInMonth = dayjs().year(year).month(month).daysInMonth();
      const dates: string[] = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = dayjs().year(year).month(month).date(day);
        dates.push(date.format('YYYY-MM-DD'));
      }
      
      return dates;
    }
    
    // 如果提供了 dateColumns，使用它
    if (dateColumns.length > 0) {
      return dateColumns;
    }
    
    // 否則從資料中提取
    const dates = new Set<string>();
    data.forEach(row => {
      if (row.dates) {
        Object.keys(row.dates).forEach(date => dates.add(date));
      }
    });
    return Array.from(dates).sort();
  };

  const dateCols = generateDateColumns();

  // 固定欄位寬度（縮小以符合 11px 字體）
  const fixedColumnWidths = {
    cellName: 90,
    productionTarget: 75,
    actualProduction: 90,
    startCultureDate: 100,
    generation: 60,
    boxCount: 60,
  };

  // 計算累積左側位置
  const getStickyLeft = (column: keyof typeof fixedColumnWidths) => {
    const columns = ['cellName', 'productionTarget', 'actualProduction', 'startCultureDate', 'generation', 'boxCount'];
    const index = columns.indexOf(column);
    return columns.slice(0, index).reduce((sum, col) => sum + fixedColumnWidths[col as keyof typeof fixedColumnWidths], 0);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
      }}
    >
      <Paper
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
        }}
      >
        <TableContainer
          sx={{
            flex: 1,
            overflowX: 'auto',
            overflowY: 'auto',
            height: '100%',
            '&::-webkit-scrollbar': {
              height: '8px',
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#555',
              },
            },
          }}
        >
          <Table stickyHeader sx={{ minWidth: 600, width: '100%', border: '1px solid', borderColor: 'divider', fontSize: '11px' }}>
            <TableHead>
              <TableRow>
                {/* 固定欄位 */}
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: getStickyLeft('cellName'),
                    zIndex: 3,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderRight: '2px solid',
                    borderColor: 'divider',
                    minWidth: fixedColumnWidths.cellName,
                    width: fixedColumnWidths.cellName,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    fontSize: '11px',
                    px: 0.5,
                    py: 0.75,
                  }}
                >
                  <TableSortLabel
                    active={sortField === 'cellName'}
                    direction={sortField === 'cellName' ? sortOrder : 'asc'}
                    onClick={() => handleSort('cellName')}
                    sx={{ fontSize: '11px' }}
                  >
                    細胞
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    position: 'sticky',
                    left: getStickyLeft('productionTarget'),
                    zIndex: 3,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderRight: '2px solid',
                    borderColor: 'divider',
                    minWidth: fixedColumnWidths.productionTarget,
                    width: fixedColumnWidths.productionTarget,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    fontSize: '11px',
                    px: 0.5,
                    py: 0.75,
                  }}
                >
                  <TableSortLabel
                    active={sortField === 'productionTarget'}
                    direction={sortField === 'productionTarget' ? sortOrder : 'asc'}
                    onClick={() => handleSort('productionTarget')}
                    sx={{ fontSize: '11px' }}
                  >
                    生產目標
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    position: 'sticky',
                    left: getStickyLeft('actualProduction'),
                    zIndex: 3,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderRight: '2px solid',
                    borderColor: 'divider',
                    minWidth: fixedColumnWidths.actualProduction,
                    width: fixedColumnWidths.actualProduction,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    fontSize: '11px',
                    px: 0.5,
                    py: 0.75,
                  }}
                >
                  <TableSortLabel
                    active={sortField === 'actualProduction'}
                    direction={sortField === 'actualProduction' ? sortOrder : 'asc'}
                    onClick={() => handleSort('actualProduction')}
                    sx={{ fontSize: '11px' }}
                  >
                    實際即時產量
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    position: 'sticky',
                    left: getStickyLeft('startCultureDate'),
                    zIndex: 3,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderRight: '2px solid',
                    borderColor: 'divider',
                    minWidth: fixedColumnWidths.startCultureDate,
                    width: fixedColumnWidths.startCultureDate,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    fontSize: '11px',
                    px: 0.5,
                    py: 0.75,
                  }}
                >
                  <TableSortLabel
                    active={sortField === 'startCultureDate'}
                    direction={sortField === 'startCultureDate' ? sortOrder : 'asc'}
                    onClick={() => handleSort('startCultureDate')}
                    sx={{
                      fontSize: '11px',
                      '& .MuiTableSortLabel-icon': {
                        opacity: 0,
                        visibility: 'hidden',
                        display: 'none',
                      },
                      '&:hover .MuiTableSortLabel-icon': {
                        opacity: 1,
                        visibility: 'visible',
                        display: 'inline-block',
                      },
                      '&.Mui-active .MuiTableSortLabel-icon': {
                        opacity: 0,
                        visibility: 'hidden',
                        display: 'none',
                      },
                      '&.Mui-active:hover .MuiTableSortLabel-icon': {
                        opacity: 1,
                        visibility: 'visible',
                        display: 'inline-block',
                      },
                    }}
                  >
                    起始培養日期
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    position: 'sticky',
                    left: getStickyLeft('generation'),
                    zIndex: 3,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderRight: '2px solid',
                    borderColor: 'divider',
                    minWidth: fixedColumnWidths.generation,
                    width: fixedColumnWidths.generation,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    fontSize: '11px',
                    px: 0.5,
                    py: 0.75,
                  }}
                >
                  <TableSortLabel
                    active={sortField === 'generation'}
                    direction={sortField === 'generation' ? sortOrder : 'asc'}
                    onClick={() => handleSort('generation')}
                    sx={{
                      fontSize: '11px',
                      '& .MuiTableSortLabel-icon': {
                        opacity: 0,
                        visibility: 'hidden',
                        display: 'none',
                      },
                      '&:hover .MuiTableSortLabel-icon': {
                        opacity: 1,
                        visibility: 'visible',
                        display: 'inline-block',
                      },
                      '&.Mui-active .MuiTableSortLabel-icon': {
                        opacity: 0,
                        visibility: 'hidden',
                        display: 'none',
                      },
                      '&.Mui-active:hover .MuiTableSortLabel-icon': {
                        opacity: 1,
                        visibility: 'visible',
                        display: 'inline-block',
                      },
                    }}
                  >
                    代數
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    position: 'sticky',
                    left: getStickyLeft('boxCount'),
                    zIndex: 3,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderRight: '2px solid',
                    borderColor: 'divider',
                    minWidth: fixedColumnWidths.boxCount,
                    width: fixedColumnWidths.boxCount,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    fontSize: '11px',
                    px: 0.5,
                    py: 0.75,
                  }}
                >
                  <TableSortLabel
                    active={sortField === 'boxCount'}
                    direction={sortField === 'boxCount' ? sortOrder : 'asc'}
                    onClick={() => handleSort('boxCount')}
                    sx={{ fontSize: '11px' }}
                  >
                    盒數
                  </TableSortLabel>
                </TableCell>

                {/* 日期欄位（可水平滾動） */}
                {dateCols.map((date, index) => {
                  const isToday = dayjs(date).isSame(dayjs(), 'day');
                  return (
                    <TableCell
                      key={date}
                      colSpan={1}
                      sx={{
                        minWidth: 80,
                        width: 80,
                        fontWeight: 'bold',
                        backgroundColor: isToday ? '#FFF8D7' : 'background.paper',
                        border: '1px solid',
                        borderLeft: index === 0 ? '2px solid' : '1px solid',
                        borderColor: 'divider',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        px: 0.5,
                        py: 0.75,
                        fontSize: '11px',
                      }}
                    >
                    <Tooltip title={dayjs(date).format('YYYY-MM-DD')}>
                      <Typography 
                        variant="body2" 
                        noWrap 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '11px',
                        }}
                      >
                        {dayjs(date).format('MM/DD')}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6 + dateCols.length} align="center" sx={{ py: 4, fontSize: '11px' }}>
                    {/* 固定欄位：細胞、生產目標、實際即時產量、起始培養日期、代數、盒數 = 6個 */}
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '11px' }}>
                      尚無資料
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((row) => (
                  <TableRow key={row.id} hover>
                    {/* 固定欄位 */}
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: getStickyLeft('cellName'),
                        zIndex: 2,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderRight: '2px solid',
                        borderColor: 'divider',
                        fontSize: '11px',
                        px: 0.5,
                        py: 0.75,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '11px' }}>
                          {row.cellName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.25 }}>
                          {onTargetEdit && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTargetEdit(row.id);
                              }}
                              sx={{
                                padding: 0.25,
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                },
                              }}
                              title="編輯生產目標"
                            >
                              <EditIcon sx={{ fontSize: '14px' }} />
                            </IconButton>
                          )}
                          {onTargetDelete && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTargetDelete(row.id);
                              }}
                              sx={{
                                padding: 0.25,
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'error.light',
                                  color: 'error.dark',
                                },
                              }}
                              title="刪除生產目標"
                            >
                              <DeleteIcon sx={{ fontSize: '14px' }} />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: getStickyLeft('productionTarget'),
                        zIndex: 2,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderRight: '2px solid',
                        borderColor: 'divider',
                        fontSize: '11px',
                        px: 0.5,
                        py: 0.75,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '11px' }}>
                        {row.productionTarget}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: getStickyLeft('actualProduction'),
                        zIndex: 2,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderRight: '2px solid',
                        borderColor: 'divider',
                        fontSize: '11px',
                        px: 0.5,
                        py: 0.75,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '11px' }}>
                        {row.actualProduction}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: getStickyLeft('startCultureDate'),
                        zIndex: 2,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderRight: '2px solid',
                        borderColor: 'divider',
                        fontSize: '11px',
                        px: 0.5,
                        py: 0.75,
                      }}
                    >
                      <Typography sx={{ fontSize: '11px' }}>
                        {dayjs(row.startCultureDate).format('MM/DD')}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: getStickyLeft('generation'),
                        zIndex: 2,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderRight: '2px solid',
                        borderColor: 'divider',
                        fontSize: '11px',
                        px: 0.5,
                        py: 0.75,
                      }}
                    >
                      <Typography sx={{ fontSize: '11px' }}>
                        P{row.generation}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: getStickyLeft('boxCount'),
                        zIndex: 2,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderRight: '2px solid',
                        borderColor: 'divider',
                        fontSize: '11px',
                        px: 0.5,
                        py: 0.75,
                      }}
                    >
                      <Typography sx={{ fontSize: '11px' }}>
                        {row.boxCount}
                      </Typography>
                    </TableCell>

                    {/* 日期欄位（可水平滾動） */}
                    {dateCols.map((date) => {
                      const dateData = row.dates?.[date];
                      const isToday = dayjs(date).isSame(dayjs(), 'day');
                      const schedules = dateData?.schedules || [];
                      const recoveryVolume = dateData?.recoveryVolume || '';
                      const actualRecoveryVolume = dateData?.actualRecoveryVolume || '';
                      const workOrderType = dateData?.workOrderType || (schedules.length > 0 ? schedules[0].ticket?.deviceId : '');
                      
                      // 判斷是否有工單
                      const hasSchedules = schedules.length > 0;
                      
                      return (
                        <TableCell
                          key={date}
                          onClick={(e) => {
                            // 如果點擊的是工單類型文字，不處理（由工單類型自己的點擊事件處理）
                            if ((e.target as HTMLElement).closest('.work-order-type-clickable')) {
                              return;
                            }
                            // 如果有工單，點擊時查看第一個工單詳情
                            if (hasSchedules && schedules[0] && onScheduleClick) {
                              onScheduleClick(schedules[0]);
                            } else {
                              // 如果沒有工單，點擊時打開新增排程視窗
                              onDateClick?.(row.id, date);
                            }
                          }}
                          sx={{
                            minWidth: 80,
                            width: 80,
                            border: '1px solid',
                            borderLeft: dateCols.indexOf(date) === 0 ? '2px solid' : '1px solid',
                            borderColor: 'divider',
                            position: 'relative',
                            padding: 0.5,
                            verticalAlign: 'top',
                            cursor: 'pointer',
                            fontSize: '11px',
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                            ...(isToday && {
                              backgroundColor: '#FFF8D7',
                              border: '2px solid',
                              borderColor: 'divider',
                            }),
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                            {/* 回收量 */}
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '9px', fontWeight: isToday ? 'bold' : 'normal' }}>
                                回收量
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '11px', fontWeight: isToday ? 'bold' : (recoveryVolume ? 'medium' : 'normal') }}>
                                {recoveryVolume || '-'}
                              </Typography>
                            </Box>
                            
                            {/* 實際回收量 */}
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '9px', fontWeight: isToday ? 'bold' : 'normal' }}>
                                實際回收量
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '11px', fontWeight: isToday ? 'bold' : (actualRecoveryVolume ? 'medium' : 'normal') }}>
                                {actualRecoveryVolume || '-'}
                              </Typography>
                            </Box>
                            
                            {/* 工單類型 */}
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '9px', fontWeight: isToday ? 'bold' : 'normal' }}>
                                工單類型
                              </Typography>
                              {hasSchedules && schedules[0] ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                  <Typography 
                                    variant="body2" 
                                    className="work-order-type-clickable"
                                    onClick={(e) => {
                                      e.stopPropagation(); // 阻止事件冒泡
                                      if (onScheduleClick) {
                                        onScheduleClick(schedules[0]);
                                      }
                                    }}
                                    sx={{ 
                                      fontSize: '11px', 
                                      fontWeight: isToday ? 'bold' : 'medium',
                                      cursor: 'pointer',
                                      color: 'primary.main',
                                      '&:hover': {
                                        textDecoration: 'underline',
                                      },
                                    }}
                                  >
                                    {workOrderType ? getTicketName(workOrderType) : '-'}
                                  </Typography>
                                  {/* 確認排程日曆圖標 */}
                                  {schedules[0].ticket && (
                                    <Tooltip title={schedules[0].ticket.scheduleConfirmed ? '已確認排程' : '未確認排程'}>
                                      <CustomCalendarIcon
                                        confirmed={schedules[0].ticket.scheduleConfirmed || false}
                                        sx={{
                                          fontSize: '14px',
                                          cursor: 'pointer',
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                  {schedules[0].status && (
                                    <Chip
                                      label={getStatusText(schedules[0].status)}
                                      size="small"
                                      sx={{
                                        height: '16px',
                                        fontSize: '8px',
                                        backgroundColor: getStatusCustomColor(schedules[0].status),
                                        color: '#000000',
                                        fontWeight: 'medium',
                                        '& .MuiChip-label': {
                                          padding: '0 4px',
                                          fontSize: '8px',
                                        },
                                        '&:hover': {
                                          opacity: 0.8,
                                        },
                                      }}
                                    />
                                  )}
                                </Box>
                              ) : (
                                <Typography variant="body2" sx={{ fontSize: '11px', fontWeight: isToday ? 'bold' : 'normal' }}>
                                  {workOrderType ? getTicketName(workOrderType) : '-'}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ProductionScheduleTable;

