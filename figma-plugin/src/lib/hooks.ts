import { useState, useCallback, useEffect } from 'react';
import { EmblaCarouselType } from 'embla-carousel';

export interface useCarouselApiType {
    selectedSnap: number;
    prevBtnDisabled: boolean;
    nextBtnDisabled: boolean;
    onPrevButtonClick: () => void;
    onNextButtonClick: () => void;
    setSelectedSnap: React.Dispatch<React.SetStateAction<number>>;
  }
  
export const useCarouselApi = (emblaApi: EmblaCarouselType | undefined): useCarouselApiType => {
    const [selectedSnap, setSelectedSnap] = useState(0);
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  
    const onPrevButtonClick = useCallback(() => {
      if (!emblaApi) return;
      emblaApi.scrollPrev();
    }, [emblaApi]);
  
    const onNextButtonClick = useCallback(() => {
      if (!emblaApi) return;
      emblaApi.scrollNext();
    }, [emblaApi]);
  
    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
      setPrevBtnDisabled(!emblaApi.canScrollPrev());
      setNextBtnDisabled(!emblaApi.canScrollNext());
      setSelectedSnap(emblaApi.selectedScrollSnap());
    }, [emblaApi,selectedSnap]);
  
    useEffect(() => {
      if (!emblaApi) return;
  
      onSelect(emblaApi);
      emblaApi.on('reInit', onSelect);
      emblaApi.on('select', onSelect);
    }, [emblaApi, onSelect]);
  
    return {
      selectedSnap,
      prevBtnDisabled,
      nextBtnDisabled,
      onPrevButtonClick,
      onNextButtonClick,
      setSelectedSnap
    };
  };