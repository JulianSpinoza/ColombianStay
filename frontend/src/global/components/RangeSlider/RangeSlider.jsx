import * as Slider from "@radix-ui/react-slider";
import './RangeSlider.css'


const RangeSlider = ({value, onValueChange, max, min, step=1}) => {

    return (

        <Slider.Root className="SliderRoot" 
            value={value}
            onValueChange={onValueChange}
            min={min} 
            max={max} 
            step={step}
        >
            <Slider.Track className="SliderTrack">
                <Slider.Range className="SliderRange" />
            </Slider.Track>
            <Slider.Thumb className="SliderThumb" aria-label="Volume" />
            <Slider.Thumb className="SliderThumb" aria-label="Volume" />
        </Slider.Root>

    );
}

export default RangeSlider;