import * as React from 'react';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup, { toggleButtonGroupClasses } from '@mui/material/ToggleButtonGroup';
import Slider from '@mui/material/Slider';
import SearchIcon from '@mui/icons-material/Search';

import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AdsClickIcon from '@mui/icons-material/AdsClick';

const CustomToggleButton = styled(ToggleButton)(({ theme }) => ({
    '&.Mui-selected': {
        backgroundColor: '#D19762',
        color: '#ffffff',
    },
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    [`& .${toggleButtonGroupClasses.grouped}`]: {
        margin: theme.spacing(0.5),
        border: 0,
        borderRadius: theme.shape.borderRadius,
        [`&.${toggleButtonGroupClasses.disabled}`]: {
            border: 0,
        },
    },
    [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]: {
        marginLeft: -1,
        borderLeft: '1px solid transparent',
    },
}));

const SliderContainer = styled('div')(({ theme }) => ({
    height: 36,
    minWidth: 120,
    margin: theme.spacing(0.5),
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: 'transparent',
    boxSizing: 'border-box',
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
    width: '100%',
    color: '#D19762',
    padding: '0 !important',
    '& .MuiSlider-thumb': {
        width: 14,
        height: 14,
    },
    '& .MuiSlider-rail': {
        opacity: 0.25,
    },
    '& .MuiSlider-track': {
        border: 'none',
    },
    '& .MuiSlider-mark': {
        width: 4,
        height: 4,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        opacity: 0.5,
    },
}));

export default function StageMenu({
    currentLabel,
    onChangeLabel,
    onReset,
    searchValue = 0,
    onSearchValueChange,
    onSearchClick,
}) {
    const [alignment, setAlignment] = React.useState('');

    const handleAlignment = (event, newAlignment) => setAlignment(newAlignment);

    const handleSliderChange = (event, newValue) => {
        if (onSearchValueChange) {
            onSearchValueChange(newValue);
        }
    };

    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                boxSizing: 'border-box',
            }}
        >
            <Paper
                elevation={0}
                sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    border: `1px solid ${theme.palette.divider}`,
                    flexWrap: 'nowrap',
                    backgroundColor: '#FBF5F0',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.12)',
                    borderRadius: '10px',
                })}
            >
                <StyledToggleButtonGroup
                    size="small"
                    value={alignment}
                    exclusive
                    onChange={handleAlignment}
                    aria-label="left group"
                >
                    <CustomToggleButton value="click-mode" aria-label="click-mode">
                        <AdsClickIcon />
                    </CustomToggleButton>

                    <CustomToggleButton
                        value="positive"
                        aria-label="positive"
                        selected={currentLabel === 1}
                        onClick={() => onChangeLabel && onChangeLabel(currentLabel === 1 ? null : 1)}
                        title="Add positive points"
                    >
                        <AddBoxIcon />
                    </CustomToggleButton>

                    <CustomToggleButton
                        value="negative"
                        aria-label="negative"
                        selected={currentLabel === 0}
                        onClick={() => onChangeLabel && onChangeLabel(currentLabel === 0 ? null : 0)}
                        title="Add negative points"
                    >
                        <IndeterminateCheckBoxIcon />
                    </CustomToggleButton>

                    <CustomToggleButton
                        value="reset"
                        aria-label="reset"
                        onClick={() => onReset && onReset()}
                        title="Reset clicks & mask"
                    >
                        <AspectRatioIcon />
                    </CustomToggleButton>
                </StyledToggleButtonGroup>

                <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        paddingRight: '4px',
                    }}
                >
                    <SliderContainer>
                        <StyledSlider
                            value={searchValue}
                            min={0}
                            max={3}
                            step={1}
                            marks
                            valueLabelDisplay="auto"
                            onChange={handleSliderChange}
                            size="small"
                        />
                    </SliderContainer>

                    <CustomToggleButton
                        value="search"
                        aria-label="search"
                        onClick={() => onSearchClick && onSearchClick(searchValue)}
                        title="Search"
                        sx={{
                            border: "none !important",
                            boxShadow: "none",
                        }}
                    >
                        <SearchIcon />
                    </CustomToggleButton>
                </div>
            </Paper>
        </div>
    );
}