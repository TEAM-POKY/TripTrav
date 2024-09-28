package com.www.triptrav.service;

import com.www.triptrav.domain.ScheduleDTO;
import com.www.triptrav.repository.ScheduleDetailMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleDetailServiceImpl implements ScheduleDetailService{
    private final ScheduleDetailMapper scheduleDetailMapper;


    @Override
    public void insertDetailPlan(long sco, long contentId, int i, int j) {
        scheduleDetailMapper.insertDetailPlan(sco, contentId, i, j);
    }

    @Override
    public void updatePlan(ScheduleDTO scheDTO) {
        scheduleDetailMapper.updatePlan(scheDTO);
    }
}
