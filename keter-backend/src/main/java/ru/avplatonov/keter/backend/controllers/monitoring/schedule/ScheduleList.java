package ru.avplatonov.keter.backend.controllers.monitoring.schedule;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.avplatonov.keter.backend.db.ScheduleDB;
import ru.avplatonov.keter.backend.initialize.monitoring.schedule.Schedule;


@RestController
@EnableAutoConfiguration
public class ScheduleList {

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @RequestMapping(value = "/graph/status")
    public List<Schedule> schedule(
            @RequestParam Optional<String> filter
            ) throws IOException {
        String newFilter = "";
        if (!filter.toString().isEmpty())
                newFilter = filter.toString();
        List<Schedule> listSchedule = new ArrayList<>();
        if(!ScheduleDB.listSchedule.isEmpty())
            return ScheduleDB.listSchedule;
        else
            listSchedule=ScheduleDB.listSchedule;

        List <String> tag = new ArrayList<>();

        for (int i = 0; i < 10; i++) {
            tag.add(String.valueOf(i));
            String name = "Graph" + i;
            String state = "canceled";
            if (i<2)
                state="planning";
            if(i>1&&i<=3)
                state = "started";
            if(i>3&&i<=5)
                state="failed";
            if(i>5&&i<=7)
                state="succeed";

            Schedule schedule = new Schedule(name, state, String.valueOf(newFilter), new Timestamp(System.currentTimeMillis()),
                    new Timestamp(System.currentTimeMillis() + System.currentTimeMillis()/(i+1)),tag);
            listSchedule.add(schedule);
        }
        ScheduleDB.listSchedule = listSchedule;
        return listSchedule;
    }
}
