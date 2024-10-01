package com.www.triptrav.repository;

import com.www.triptrav.domain.ScheduleDTO;
import com.www.triptrav.domain.ScheduleVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ScheduleMapper {
    int insertPlan(ScheduleVO scheVO);

    List<ScheduleDTO> getSchedule(@Param("sco") long sco, @Param("date") int date);

    void updatePlanName(@Param("scheName") String scheName, @Param("sco") long sco);
}