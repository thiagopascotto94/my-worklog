import React, { useState } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography, Tooltip, IconButton, Popover } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import * as taskService from '../services/taskService';
import { Task } from '../services/taskService';

interface TaskAutocompleteProps {
    value: Task | null;
    onChange: (newValue: Task | null) => void;
    label: string;
    disabledIds?: number[];
}

const TaskAutocomplete: React.FC<TaskAutocompleteProps> = ({ value, onChange, label, disabledIds = [] }) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [popoverAnchorEl, setPopoverAnchorEl] = useState<null | HTMLElement>(null);
    const [detailsTask, setDetailsTask] = useState<Task | null>(null);

    const handleViewDetailsClick = (event: React.MouseEvent<HTMLElement>, task: Task) => {
        event.stopPropagation();
        setPopoverAnchorEl(event.currentTarget);
        setDetailsTask(task);
    };

    const handlePopoverClose = () => {
        setPopoverAnchorEl(null);
        setDetailsTask(null);
    };

    const fetchTasks = async (searchTerm: string) => {
        if (searchTerm.length < 3) {
            setOptions([]);
            return;
        }
        setLoading(true);
        try {
            const res = await taskService.getAllTasks(searchTerm);
            setOptions(res.data);
        } catch (error) {
            console.error('Failed to fetch tasks for autocomplete', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Autocomplete
                id={`task-autocomplete-${label.replace(/\s+/g, '-').toLowerCase()}`}
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.title}
                getOptionDisabled={(option) => disabledIds.includes(option.id)}
                options={options}
                loading={loading}
                value={value}
                onChange={(event, newValue) => onChange(newValue)}
                onInputChange={(event, newInputValue) => {
                    fetchTasks(newInputValue);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={label}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1">{option.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(option.createdAt).toLocaleDateString()}
                          {option.tags && ` - Tags: ${option.tags}`}
                        </Typography>
                      </Box>
                      <Tooltip title="View Details">
                        <IconButton
                          edge="end"
                          aria-label="details"
                          onClick={(event) => handleViewDetailsClick(event, option)}
                        >
                          <InfoOutlined />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </li>
                )}
            />
            <Popover
                open={Boolean(popoverAnchorEl)}
                anchorEl={popoverAnchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Box sx={{ p: 2, maxWidth: 300 }}>
                    {detailsTask && (
                        <>
                            <Typography variant="h6">Details</Typography>
                            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold' }}>Description</Typography>
                            <Typography variant="body2" paragraph>{detailsTask.description || 'N/A'}</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Observations</Typography>
                            <Typography variant="body2">{detailsTask.observations || 'N/A'}</Typography>
                        </>
                    )}
                </Box>
            </Popover>
        </>
    );
};

export default TaskAutocomplete;
