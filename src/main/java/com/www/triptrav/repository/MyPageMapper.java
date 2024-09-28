package com.www.triptrav.repository;

import com.www.triptrav.domain.ReviewDTO;
import com.www.triptrav.domain.ReviewImageVO;
import com.www.triptrav.domain.ReviewVO;
import com.www.triptrav.domain.UserVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MyPageMapper {
    UserVO isSocial(long uno);

    List<UserVO> scheduleCall(long uno);

    List<ReviewVO> getReviewList(long uno);

    List<ReviewImageVO> getReviewDTOList(long uno);

    ReviewVO getPopReview(long rno);
}
