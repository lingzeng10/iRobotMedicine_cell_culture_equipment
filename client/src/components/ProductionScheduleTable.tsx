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
import { getTicketName, getStatusText, getStatusColor } from '../utils/stationMapping';

interface ProductionScheduleTableProps {
  data: ProductionScheduleRow[];
  dateColumns?: string[]; // 可選的日期欄位列表
  onDateClick?: (targetId: string, date: string) => void; // 點擊日期時的回調（新增排程）
  onScheduleClick?: (schedule: TicketScheduleWithRelations) => void; // 點擊工單排程時的回調（查看詳情）
  onScheduleEdit?: (schedule: TicketScheduleWithRelations) => void; // 編輯工單排程時的回調
  onScheduleDelete?: (scheduleId: string) => void; // 刪除工單排程時的回調
}

type SortField = 'cellName' | 'productionTarget' | 'actualProduction' | 'startCultureDate' | 'generation' | 'boxCount';
type SortOrder = 'asc' | 'desc';

const ProductionScheduleTable: React.FC<ProductionScheduleTableProps> = ({
  data,
  dateColumns = [],
  onDateClick,
  onScheduleClick,
  onScheduleEdit,
  onScheduleDelete,
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
    if (dateColumns.length === 0) {
      // 如果沒有提供日期欄位，從資料中提取
      const dates = new Set<string>();
      data.forEach(row => {
        if (row.dates) {
          Object.keys(row.dates).forEach(date => dates.add(date));
        }
      });
      return Array.from(dates).sort();
    }
    return dateColumns;
  };

  const dateCols = generateDateColumns();

  // 固定欄位寬度
  const fixedColumnWidths = {
    cellName: 120,
    productionTarget: 100,
    actualProduction: 100,
    startCultureDate: 140,
    generation: 80,
    boxCount: 80,
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
          <Table stickyHeader sx={{ minWidth: 800, width: '100%' }}>
            <TableHead>
              <TableRow>
                {/* 固定欄位 */}
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: getStickyLeft('cellName'),
                    zIndex: 3,
                    backgroundColor: 'background.paper',
                    borderRight: '2px solid',
                    borderColor: 'divider',
                    minWidth: fixedColumnWidths.cellName,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <TableSortLabel
                    active={sortField === 'cellName'}
                    direction={sortField === 'cellName' ? sortOrder : 'asc'}
                    onClick={() => handleSort('cellName')}
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
                    borderRight: '2px solid',
                    borderColor: 'divider',
                    minWidth: fixedColumnWidths.productionTarget,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <TableSortLabel
                    active={sortField === 'productionTarget'}
                    direction={sortField === 'productionTarget' ? sortOrder : 'asc'}
                    onClick={() => handleSort('productionTarget')}
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
                    borderRight: '2px solid',
                    borderColor: 'divider',
                    minWidth: fixedColumnWidths.actualProduction,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <TableSortLabel
                    active={sortField === 'actualProduction'}
                    direction={sortField === 'actualProduction' ? sortOrder : 'asc'}
                    onClick={() => handleSort('actualProduction')}
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
                    borderRight: '2px solid',
                    borderColor: 'divider',
                    minWidth: fixedColumnWidths.startCultureDate,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <TableSortLabel
                    active={sortField === 'startCultureDate'}
                    direction={sortField === 'startCultureDate' ? sortOrder : 'asc'}
                    onClick={() => handleSort('startCultureDate')}
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
                    borderRight: '2px solid',
                    borderColor: 'divider',
                    minWidth: fixedColumnWidths.generation,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <TableSortLabel
                    active={sortField === 'generation'}
                    direction={sortField === 'generation' ? sortOrder : 'asc'}
                    onClick={() => handleSort('generation')}
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
                    borderRight: '2px solid',
                    borderColor: 'divider',
                    minWidth: fixedColumnWidths.boxCount,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <TableSortLabel
                    active={sortField === 'boxCount'}
                    direction={sortField === 'boxCount' ? sortOrder : 'asc'}
                    onClick={() => handleSort('boxCount')}
                  >
                    盒數
                  </TableSortLabel>
                </TableCell>

                {/* 日期欄位（可水平滾動） */}
                {dateCols.map((date, index) => (
                  <TableCell
                    key={date}
                    colSpan={1}
                    sx={{
                      minWidth: 100,
                      width: 100,
                      fontWeight: 'bold',
                      backgroundColor: 'background.paper',
                      borderLeft: index === 0 ? '2px solid' : 'none',
                      borderColor: 'divider',
                      whiteSpace: 'nowrap',
                      textAlign: 'center',
                      px: 0.5,
                      py: 1,
                    }}
                  >
                    <Tooltip title={dayjs(date).format('YYYY-MM-DD')}>
                      <Typography 
                        variant="body2" 
                        noWrap 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                        }}
                      >
                        {dayjs(date).format('MM/DD')}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6 + dateCols.length} align="center" sx={{ py: 4 }}>
                    {/* 固定欄位：細胞、生產目標、實際即時產量、起始培養日期、代數、盒數 = 6個 */}
                    <Typography variant="body2" color="text.secondary">
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
                        borderRight: '2px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {row.cellName}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: getStickyLeft('productionTarget'),
                        zIndex: 2,
                        backgroundColor: 'background.paper',
                        borderRight: '2px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="body2">
                        {row.productionTarget}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: getStickyLeft('actualProduction'),
                        zIndex: 2,
                        backgroundColor: 'background.paper',
                        borderRight: '2px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="body2">
                        {row.actualProduction}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: getStickyLeft('startCultureDate'),
                        zIndex: 2,
                        backgroundColor: 'background.paper',
                        borderRight: '2px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {dayjs(row.startCultureDate).format('YYYY-MM-DD')}
                    </TableCell>

                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: getStickyLeft('generation'),
                        zIndex: 2,
                        backgroundColor: 'background.paper',
                        borderRight: '2px solid',
                        borderColor: 'divider',
                      }}
                    >
                      P{row.generation}
                    </TableCell>

                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: getStickyLeft('boxCount'),
                        zIndex: 2,
                        backgroundColor: 'background.paper',
                        borderRight: '2px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {row.boxCount}
                    </TableCell>

                    {/* 日期欄位（可水平滾動） */}
                    {dateCols.map((date) => {
                      const dateData = row.dates?.[date];
                      const isToday = dayjs(date).isSame(dayjs(), 'day');
                      const schedules = dateData?.schedules || [];
                      const recoveryVolume = dateData?.recoveryVolume || '';
                      const actualRecoveryVolume = dateData?.actualRecoveryVolume || '';
                      const workOrderType = dateData?.workOrderType || (schedules.length > 0 ? schedules[0].ticket?.deviceId : '');
                      
                      return (
                        <TableCell
                          key={date}
                          onClick={() => onDateClick?.(row.id, date)}
                          sx={{
                            minWidth: 100,
                            width: 100,
                            borderLeft: dateCols.indexOf(date) === 0 ? '2px solid' : 'none',
                            borderColor: 'divider',
                            position: 'relative',
                            padding: 0.5,
                            verticalAlign: 'top',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                            ...(isToday && {
                              backgroundColor: 'action.selected',
                              border: '2px solid',
                              borderColor: 'primary.main',
                            }),
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {/* 回收量 */}
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                回收量
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: recoveryVolume ? 'medium' : 'normal' }}>
                                {recoveryVolume || '-'}
                              </Typography>
                            </Box>
                            
                            {/* 實際回收量 */}
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                實際回收量
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: actualRecoveryVolume ? 'medium' : 'normal' }}>
                                {actualRecoveryVolume || '-'}
                              </Typography>
                            </Box>
                            
                            {/* 工單類型 */}
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                工單類型
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: workOrderType ? 'medium' : 'normal' }}>
                                {workOrderType ? getTicketName(workOrderType) : '-'}
                              </Typography>
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

