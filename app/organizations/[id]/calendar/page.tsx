"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

type Event = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  created_by: string;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const organizationId = params.id as string;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "list">("month");

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch events for this organization
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("organization_id", organizationId)
        .order("start_time", { ascending: true });

      if (eventsError) {
        console.error("Error fetching events:", eventsError);
      } else if (eventsData) {
        setEvents(eventsData);
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase, router, organizationId]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const formatDateFull = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem 3rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            color: "#64748b",
            fontSize: "1.125rem",
          }}
        >
          Loading calendar...
        </div>
      </div>
    );
  }

  const calendarDays = getDaysInMonth(currentDate);
  const upcomingEvents = events
    .filter(e => new Date(e.start_time) >= new Date())
    .slice(0, 5);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        padding: "3rem 2rem",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "2.5rem",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: "0.5rem",
              }}
            >
              Calendar
            </h1>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                padding: "4px",
                display: "flex",
                gap: "4px",
              }}
            >
              <button
                onClick={() => setViewMode("month")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: viewMode === "month" ? "#448bfc" : "transparent",
                  color: viewMode === "month" ? "white" : "#64748b",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("list")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: viewMode === "list" ? "#448bfc" : "transparent",
                  color: viewMode === "list" ? "white" : "#64748b",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                List
              </button>
            </div>

            <Button
              onClick={() => router.push(`/organizations/${organizationId}/calendar/new`)}
              style={{
                backgroundColor: "#448bfc",
                color: "white",
                fontWeight: 500,
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                border: "none",
                transition: "all 0.3s",
                boxShadow: "0 4px 12px rgba(68, 139, 252, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#3378e8";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#448bfc";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Plus size={18} /> Add Event
            </Button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 700px", minWidth: 0 }}>
            {viewMode === "month" ? (
              <div
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1.5rem",
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1e293b" }}>
                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => navigateMonth(-1)}
                      style={{
                        padding: "0.5rem",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      <ChevronLeft size={20} color="#64748b" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "white",
                        cursor: "pointer",
                        fontWeight: 500,
                        color: "#64748b",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => navigateMonth(1)}
                      style={{
                        padding: "0.5rem",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      <ChevronRight size={20} color="#64748b" />
                    </button>
                  </div>
                </div>

                <div style={{ padding: "1rem" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {DAYS.map(day => (
                      <div
                        key={day}
                        style={{
                          textAlign: "center",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "#64748b",
                          padding: "0.5rem",
                        }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: "0.5rem",
                    }}
                  >
                    {calendarDays.map((date, index) => {
                      const dateEvents = date ? getEventsForDate(date) : [];
                      const isTodayDate = date ? isToday(date) : false;

                      return (
                        <div
                          key={index}
                          onClick={() => date && setSelectedDate(date)}
                          style={{
                            minHeight: "100px",
                            padding: "0.5rem",
                            borderRadius: "8px",
                            border: `1px solid ${isTodayDate ? "#448bfc" : "#e2e8f0"}`,
                            backgroundColor: date ? (isTodayDate ? "#eff6ff" : "white") : "#f8fafc",
                            cursor: date ? "pointer" : "default",
                            transition: "all 0.2s",
                            position: "relative",
                          }}
                          onMouseEnter={(e) => {
                            if (date) {
                              e.currentTarget.style.backgroundColor = isTodayDate ? "#dbeafe" : "#f8fafc";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (date) {
                              e.currentTarget.style.backgroundColor = isTodayDate ? "#eff6ff" : "white";
                            }
                          }}
                        >
                          {date && (
                            <>
                              <div
                                style={{
                                  fontWeight: isTodayDate ? 700 : 500,
                                  color: isTodayDate ? "#448bfc" : "#1e293b",
                                  marginBottom: "0.25rem",
                                }}
                              >
                                {date.getDate()}
                              </div>
                              {dateEvents.slice(0, 2).map(event => (
                                <div
                                  key={event.id}
                                  style={{
                                    fontSize: "0.75rem",
                                    padding: "2px 6px",
                                    backgroundColor: "#448bfc",
                                    color: "white",
                                    borderRadius: "4px",
                                    marginBottom: "2px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dateEvents.length > 2 && (
                                <div
                                  style={{
                                    fontSize: "0.7rem",
                                    color: "#64748b",
                                    fontWeight: 500,
                                  }}
                                >
                                  +{dateEvents.length - 2} more
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div
                  style={{
                    padding: "1rem 1.5rem",
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  All Events
                </div>
                {events.length === 0 ? (
                  <p
                    style={{
                      padding: "2rem 1.5rem",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    No events scheduled.
                  </p>
                ) : (
                  events.map((event, index) => (
                    <div
                      key={event.id}
                      style={{
                        padding: "1.25rem 1.5rem",
                        borderBottom: index < events.length - 1 ? "1px solid #f1f5f9" : "none",
                        transition: "background-color 0.2s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                        <div
                          style={{
                            width: "60px",
                            textAlign: "center",
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#64748b",
                              fontWeight: 600,
                              textTransform: "uppercase",
                            }}
                          >
                            {new Date(event.start_time).toLocaleDateString("en-US", { month: "short" })}
                          </div>
                          <div
                            style={{
                              fontSize: "1.75rem",
                              fontWeight: 700,
                              color: "#1e293b",
                            }}
                          >
                            {new Date(event.start_time).getDate()}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3
                            style={{
                              fontSize: "1.125rem",
                              fontWeight: 600,
                              color: "#1e293b",
                              marginBottom: "0.25rem",
                            }}
                          >
                            {event.title}
                          </h3>
                          <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                            {formatTime(event.start_time)} - {formatTime(event.end_time)}
                          </p>
                          {event.location && (
                            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                              📍 {event.location}
                            </p>
                          )}
                          {event.description && (
                            <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={{ flex: "0 0 300px" }}>
            <div
              style={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div
                style={{
                  padding: "1rem 1.5rem",
                  backgroundColor: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Upcoming Events
              </div>
              {upcomingEvents.length === 0 ? (
                <p
                  style={{
                    padding: "2rem 1.5rem",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "0.875rem",
                  }}
                >
                  No upcoming events.
                </p>
              ) : (
                upcomingEvents.map((event, index) => (
                  <div
                    key={event.id}
                    style={{
                      padding: "1rem 1.5rem",
                      borderBottom: index < upcomingEvents.length - 1 ? "1px solid #f1f5f9" : "none",
                      transition: "background-color 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "#1e293b",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {event.title}
                    </h4>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>
                      {formatDateFull(event.start_time)}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {formatTime(event.start_time)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}