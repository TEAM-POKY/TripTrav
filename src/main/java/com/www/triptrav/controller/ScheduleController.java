package com.www.triptrav.controller;

import ch.qos.logback.core.rolling.helper.IntegerTokenConverter;
import com.www.triptrav.domain.*;
import com.www.triptrav.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/schedule/*")
@Slf4j
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService ssv;
    private final ScheduleDetailService sdsv;
    private final ScheduleRoleService srsv;
    private final ScheduleMemoService smsv;
    private final InviteService inviteService;
    @Value("${invite.secret-key}")
    private String secretKey;

    @GetMapping("/check")
    public void checkPlan() {}

    @PostMapping("/createPlan/{contentId}/{currentPlaceName}")
    @ResponseBody
    @Transactional
    public String createPlan(@RequestBody JSONObject ScheVO, @PathVariable("contentId") long contentId,
                             @PathVariable("currentPlaceName") String placeTitle) throws ParseException{
        log.info("schePlaceTitle : {}", placeTitle);
        JSONParser parser = new JSONParser();
        JSONObject sche = (JSONObject) parser.parse(ScheVO.toJSONString());

        ScheduleVO scheVO = new ScheduleVO();

        scheVO.setScheName((String) sche.get("sche_name"));
        scheVO.setScheStart((String) sche.get("sche_start"));
        scheVO.setScheEnd((String) sche.get("sche_end"));
        scheVO.setScheCount(((Long) sche.get("sche_count")).intValue());
        scheVO.setUno(Long.parseLong((String)sche.get("uno")));
        log.info("pvo:{}", scheVO);
        log.info("contentID{}",contentId);

        int isOk = ssv.insertPlan(scheVO,contentId);
        if(isOk>0){
            srsv.insertRole(scheVO.getSco(), scheVO.getUno(), 1);
            sdsv.insertDetailPlan(scheVO.getSco(), contentId, 1, 1, placeTitle);
        }

        return isOk>0?"1":"0";
    }

    @PostMapping("/course/{sco}/{date}")
    @ResponseBody
    public List<ScheduleDTO> course(@PathVariable("sco") long sco, @PathVariable("date") int date){
        log.info(String.valueOf(sco));
        List<ScheduleDTO> sdDTO = ssv.getSchedule(sco, date);
        log.info("sdDTO : {}",sdDTO);
        return sdDTO;
    }

    @PutMapping("/modifyPlan/{sco}/{sche_date}")
    @ResponseBody
    public String modifyPlan(@RequestBody List<JSONObject> sdtoList, @PathVariable("sco") long sco, @PathVariable("sche_date") int sche_date) throws ParseException {
        log.info("sdtoList : {}", sdtoList);
        sdsv.emptyPlan(sco,sche_date);

        for (JSONObject sche : sdtoList) {
            int planIndex = (int) sche.get("planIndex");

            ScheduleDTO scheDTO = new ScheduleDTO();
            scheDTO.setScheContentId(Long.parseLong((String) sche.get("sche_content_id")));
            scheDTO.setScheIndex(planIndex);
            scheDTO.setScheDate(Integer.parseInt((String) sche.get("sche_date")));
            scheDTO.setScheName((String) sche.get("sche_name"));
            scheDTO.setSco(Long.parseLong((String) sche.get("sco")));
            scheDTO.setScheTitle((String) sche.get("sche_title"));

            sdsv.updatePlan(scheDTO);
            String scheName = (String) sche.get("sche_name");
            int isOk = ssv.updatePlanName(scheName, sco);
        }

        return "1";
    }

    @PostMapping("/plan/{sco}/{date}")
    @ResponseBody
    public List<ScheduleDetailVO> getPlanData(@PathVariable("sco")long sco, @PathVariable("date")int date){
        List<ScheduleDetailVO> scheDVO = sdsv.getPlanDate(sco, date);
        return scheDVO;
    }

    @PostMapping("/memo/{sco}")
    @ResponseBody
    @Transactional
    public String saveMemo(@PathVariable("sco") long sco, @RequestBody String memo){
        int isOk = ssv.insertMemo(1, sco);
        int memoResult = 0;
        memo = memo.substring(1, memo.length()-1);
        log.info("memo :{}", memo);
        if(isOk>0){
            memoResult = smsv.insertMemoContent(memo, sco);
        }
        return memoResult>0?"1":"0";
    }

    @PostMapping("/getMemo/{sco}")
    @ResponseBody
    public ScheduleMemoVO getMemo(@PathVariable("sco") long sco){
        int memo = ssv.getMemoYN(sco);
        log.info("memo YN : {}",memo);
        if(memo==1){
            ScheduleMemoVO sdmVO = smsv.getMemo(sco);
            return sdmVO;
        } else {
            return null;
        }
    }

    @PutMapping("/memoModify/{sco}")
    @ResponseBody
    public String modifyMemo(@PathVariable("sco")long sco, @RequestBody String memo){
        memo = memo.substring(1, memo.length()-1);
        int isOk = smsv.modifyMemo(memo, sco);
        return isOk>0?"1":"0";
    }

    @DeleteMapping("/memoDelete/{sco}")
    @ResponseBody
    public String deleteMemo(@PathVariable("sco")long sco){
        int isOk = smsv.deleteMemo(sco);
        if(isOk>0){
            ssv.updateMemoYN(sco);
            return "1";
        } else{
            return "0";
        }
    }

    @PostMapping("/allCourse/{sco}")
    @ResponseBody
    public List<ScheduleDetailVO> getAllCourse(@PathVariable("sco")long sco){
        List<ScheduleDetailVO> sdvo = sdsv.getAllCourse(sco);
        return sdvo;
    }

    @PostMapping("/generateInviteUrl")
    @ResponseBody
    public ResponseEntity<?> inviteToken(@RequestBody InviteVO inviteVO) {
        log.info("sco: {}, uno: {}", inviteVO.getSco(), inviteVO.getUno());
        try {
            String dataToEncrypt = inviteVO.getSco() + ":" + inviteVO.getUno();
            String inviteToken = InviteService.encrypt(dataToEncrypt, secretKey);
            log.info("inviteToken {}", inviteToken);

            String inviteUrl = "http://localhost:8099/schedule/invite?token="+inviteToken;

            return ResponseEntity.ok(Collections.singletonMap("inviteUrl", inviteUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
         .body(Collections.singletonMap("message", "초대 URL 생성 중 오류가 발생했습니다."));
        }
    }

    @GetMapping("/invite")
    public String inviteUser(@RequestParam String token){
        try {
            String decryptedData = InviteService.decrypt(token, secretKey);
            log.info("decryptedData : {}", decryptedData);

            String[] parts = decryptedData.split(":");
            String sco = parts[0];
            String uno = parts[1];

            return "redirect:/schedule/check?sco="+sco;
        } catch (Exception e) {
            return"잘못된 초대 URL입니다.";
        }
    }

}