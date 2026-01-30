import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Check, ChevronRight, ChevronLeft, X, Edit2, Clock, Flame, Trash2, Save, User } from 'lucide-react';

const ExerciseDB = {
  'грудь': ['жим штанги от груди', 'жим от груди в тренажере', 'жим гантелей лежа', 'жим на наклонной скамье', 'разводка гантелей', 'отжимания на брусьях', 'отжимания', 'кроссовер', 'пуловер', 'баттерфляй'],
  'спина': ['подтягивания прямым хватом', 'подтягивания узким хватом', 'тяга штанги в наклоне', 'тяга гантелей в наклоне', 'становая тяга', 'тяга верхнего блока к груди', 'тяга горизонтального блока', 'гиперэкстензия', 'тяга т-грифа', 'шраги', 'лицевые тяги'],
  'ноги': ['присед со свободным весом', 'присед в smith', 'жим ногами', 'разгибание ног', 'сгибание ног', 'разведение ног в тренажере', 'выпады', 'румынская тяга', 'болгарский сплит-присед', 'подъем на носки стоя', 'подъем на носки сидя'],
  'ягодицы': ['ягодичный мост со свободным весом', 'ягодичный мост хип-траст'],
  'плечи': ['жим штанги стоя', 'жим гантелей сидя', 'разведение рук в стороны с гантелями', 'махи гантелями перед собой', 'махи в наклоне', 'тяга штанги к подбородку', 'жим арнольда', 'обратные разведения'],
  'руки': ['подъем штанги на бицепс', 'сгибания рук на бицепс', 'подъем гантелей на бицепс', 'молотки', 'французский жим', 'разгибание рук на блоке', 'жим узким хватом', 'концентрированный подъем', 'разгибание рук из-за головы'],
  'пресс': ['скручивания', 'планка на локтях', 'подъем ног в висе', 'подъем ног', 'боковая планка', 'велосипед', 'русский твист', 'подъем ног лежа', 'дровосек на блоке']
};

const DiffColors = {
  easy: { bg: 'bg-green-400', label: 'легко', emoji: '😊' },
  medium: { bg: 'bg-amber-400', label: 'средне', emoji: '😐' },
  hard: { bg: 'bg-red-400', label: 'тяжело', emoji: '😤' }
};

const EMOJI_OPTIONS = ['🐸', '🦗', '🦆', '🦣', '🐭', '🦜', '🦨', '🐓', '🪱', '🦢', '🐑', '🦇'];

const calcCalories = (exercises) => {
  if (!exercises.length) return 0;
  let totalCals = 0;
  exercises.forEach(exercise => {
    let calsPerSet = 5;
    if (exercise.difficulty === 'hard') calsPerSet = 8;
    else if (exercise.difficulty === 'medium') calsPerSet = 6;
    if (exercise.weight > 0) {
      calsPerSet += exercise.weight * 0.3;
    }
    totalCals += calsPerSet * exercise.sets * exercise.reps * 0.1;
  });
  return Math.round(totalCals);
};

const getStatus = (workoutHistory) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthWorkouts = workoutHistory.filter(w => {
    const wDate = new Date(w.date);
    return wDate.getMonth() === currentMonth && wDate.getFullYear() === currentYear;
  }).length;
  
  if (monthWorkouts === 0) return 'отставить сдутие!';
  if (monthWorkouts <= 4) return 'не скуфирован';
  if (monthWorkouts <= 10) return 'машинка';
  return 'шоу титаны';
};

export default function VesaApp() {
  const [screen, setScreen] = useState('profile');
  const [userData, setUserData] = useState({ gender: '', age: '', height: '', weight: '', avatar: '🐸' });
  const [workoutSets, setWorkoutSets] = useState([]);
  const [currentWorkout, setCurrentWorkout] = useState({ name: '', exercises: [], duration: 60, notes: '', date: new Date() });
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showCreateSetModal, setShowCreateSetModal] = useState(false);
  const [viewingWorkouts, setViewingWorkouts] = useState([]);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [newSetName, setNewSetName] = useState('');
  const [newSetExercises, setNewSetExercises] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [exerciseContext, setExerciseContext] = useState('workout');

  useEffect(() => {
    const savedUserData = localStorage.getItem('vesa_user');
    const savedSets = localStorage.getItem('vesa_sets');
    const savedHistory = localStorage.getItem('vesa_history');
    if (savedUserData) { 
      const parsed = JSON.parse(savedUserData);
      setUserData({ ...parsed, avatar: parsed.avatar || '🐸' }); 
      setScreen('main'); 
    }
    if (savedSets) setWorkoutSets(JSON.parse(savedSets));
    if (savedHistory) setWorkoutHistory(JSON.parse(savedHistory));
  }, []);

  const saveUserData = () => {
    localStorage.setItem('vesa_user', JSON.stringify(userData));
    setScreen('main');
  };

  const handleDeleteSet = (setId) => {
    const updatedSets = workoutSets.filter(s => s.id !== setId);
    setWorkoutSets(updatedSets);
    localStorage.setItem('vesa_sets', JSON.stringify(updatedSets));
    setConfirmDelete(null);
  };

  const handleDeleteWorkout = (workoutId) => {
    const newHistory = workoutHistory.filter(w => w.id !== workoutId);
    setWorkoutHistory(newHistory);
    localStorage.setItem('vesa_history', JSON.stringify(newHistory));
    const updatedViewing = viewingWorkouts.filter(w => w.id !== workoutId);
    if (updatedViewing.length === 0) {
      setViewingWorkouts([]);
    } else {
      setViewingWorkouts(updatedViewing);
    }
    setConfirmDelete(null);
  };

  const openCreateSetModal = () => {
    setNewSetName('');
    setNewSetExercises([]);
    setExerciseContext('newset');
    setShowCreateSetModal(true);
  };

  const saveNewSet = () => {
    if (!newSetName.trim() || newSetExercises.length === 0) return;
    const newSet = { 
      id: Date.now(), 
      name: newSetName.trim(), 
      exercises: newSetExercises 
    };
    const updatedSets = [...workoutSets, newSet];
    setWorkoutSets(updatedSets);
    localStorage.setItem('vesa_sets', JSON.stringify(updatedSets));
    setShowCreateSetModal(false);
    setNewSetName('');
    setNewSetExercises([]);
  };

  const saveCurrentWorkoutAsSet = () => {
    if (!newSetName.trim() || currentWorkout.exercises.length === 0) return;
    const newSet = { 
      id: Date.now(), 
      name: newSetName.trim(), 
      exercises: currentWorkout.exercises 
    };
    const updatedSets = [...workoutSets, newSet];
    setWorkoutSets(updatedSets);
    localStorage.setItem('vesa_sets', JSON.stringify(updatedSets));
    setNewSetName('');
  };

  const saveWorkout = () => {
    const calories = calcCalories(currentWorkout.exercises);
    const avgDifficulty = getAvgDiff(currentWorkout.exercises);
    const workout = {
      id: editingWorkout?.id || Date.now(),
      date: currentWorkout.date.toISOString(),
      name: currentWorkout.name,
      exercises: currentWorkout.exercises,
      duration: currentWorkout.duration,
      notes: currentWorkout.notes,
      calories,
      difficulty: avgDifficulty
    };
    let newHistory;
    if (editingWorkout) {
      newHistory = workoutHistory.map(w => w.id === editingWorkout.id ? workout : w);
    } else {
      newHistory = [...workoutHistory, workout];
    }
    setWorkoutHistory(newHistory);
    localStorage.setItem('vesa_history', JSON.stringify(newHistory));
    setCurrentWorkout({ name: '', exercises: [], duration: 60, notes: '', date: new Date() });
    setEditingWorkout(null);
    setScreen('main');
  };

  const editWorkout = (workout) => {
    setEditingWorkout(workout);
    setCurrentWorkout({
      name: workout.name,
      exercises: workout.exercises.map(ex => ({...ex, id: Date.now() + Math.random()})),
      duration: workout.duration,
      notes: workout.notes || '',
      date: new Date(workout.date)
    });
    setViewingWorkouts([]);
    setScreen('workout');
  };

  const getAvgDiff = (exercises) => {
    if (!exercises.length) return 'easy';
    const scores = { easy: 1, medium: 2, hard: 3 };
    const avg = exercises.reduce((sum, ex) => sum + scores[ex.difficulty], 0) / exercises.length;
    if (avg <= 1.5) return 'easy';
    if (avg <= 2.5) return 'medium';
    return 'hard';
  };

  const addExerciseToWorkout = (exerciseName) => {
    console.log('Добавляем упражнение в тренировку:', exerciseName);
    setCurrentWorkout({
      ...currentWorkout,
      exercises: [...currentWorkout.exercises, {
        id: Date.now(),
        name: exerciseName,
        weight: 0,
        sets: 3,
        reps: 10,
        difficulty: 'medium'
      }]
    });
    setShowExerciseModal(false);
  };

  const addExerciseToNewSet = (exerciseName) => {
    console.log('Добавляем упражнение в новый сет:', exerciseName);
    setNewSetExercises([...newSetExercises, {
      id: Date.now(),
      name: exerciseName,
      weight: 0,
      sets: 3,
      reps: 10,
      difficulty: 'medium'
    }]);
    setShowExerciseModal(false);
  };

  const updateExercise = (id, field, value) => {
    setCurrentWorkout({
      ...currentWorkout,
      exercises: currentWorkout.exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex)
    });
  };

  const removeExercise = (id) => {
    setCurrentWorkout({
      ...currentWorkout,
      exercises: currentWorkout.exercises.filter(ex => ex.id !== id)
    });
  };

  const removeNewSetExercise = (id) => {
    setNewSetExercises(newSetExercises.filter(ex => ex.id !== id));
  };

  const getDayColor = (date) => {
    const dayWorkouts = workoutHistory.filter(w => new Date(w.date).toDateString() === date.toDateString());
    if (!dayWorkouts.length) return 'bg-white/10';
    return DiffColors[dayWorkouts[0].difficulty].bg;
  };

  const handleDayClick = (date) => {
    const dayWorkouts = workoutHistory.filter(w => new Date(w.date).toDateString() === date.toDateString());
    if (dayWorkouts.length > 0) {
      setViewingWorkouts(dayWorkouts);
    } else {
      setEditingWorkout(null);
      setCurrentWorkout({ name: '', exercises: [], duration: 60, notes: '', date: new Date(date) });
      setScreen('workout');
    }
  };

  const renderCal = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const color = getDayColor(date);
      const dayWorkouts = workoutHistory.filter(w => new Date(w.date).toDateString() === date.toDateString());
      const hasWorkout = dayWorkouts.length > 0;
      days.push(
        <button
          key={day}
          onClick={() => handleDayClick(date)}
          className="aspect-square rounded-full flex items-center justify-center text-gray-800 font-bold text-sm transition-all hover:scale-105 cursor-pointer shadow-lg"
          style={hasWorkout ? {
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            background: 'rgba(251, 146, 60, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 4px 16px 0 rgba(249, 115, 22, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.7)'
          } : {
            background: color,
            opacity: 0.5
          }}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  const today = new Date();
  const weekdays = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const todayString = `${today.getDate()} ${months[today.getMonth()]}, ${weekdays[today.getDay()]}`;

  if (screen === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-300 via-green-200 to-lime-100 p-6 font-sans">
        <div className="max-w-md mx-auto">
          <div className="mb-10 mt-8">
            <h1 className="text-6xl font-black text-gray-800 mb-1" style={{ fontFamily: 'Arial Black, sans-serif', fontStyle: 'italic', letterSpacing: '-2px', transform: 'scaleY(0.85) skewX(-8deg)', transformOrigin: 'left', fontWeight: 900 }}>vesá</h1>
            <p className="text-gray-700 text-base lowercase ml-1">твой дневник тренировок</p>
          </div>
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg">
            <h2 className="text-xl font-bold mb-6 text-gray-800 lowercase">расскажи о себе</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-gray-600 lowercase">выбери аватар</label>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-lime-400 to-green-400 flex items-center justify-center text-3xl shadow-lg hover:scale-105 transition-all"
                >
                  {userData.avatar}
                </button>
                <span className="text-sm text-gray-600 lowercase">нажми чтобы выбрать</span>
              </div>
              {showAvatarPicker && (
                <div className="mt-3 grid grid-cols-6 gap-2 bg-white/50 p-3 rounded-xl">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setUserData({...userData, avatar: emoji});
                        setShowAvatarPicker(false);
                      }}
                      className="w-10 h-10 rounded-lg bg-white hover:bg-lime-100 flex items-center justify-center text-2xl transition-all hover:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600 lowercase">пол</label>
                <div className="flex gap-3">
                  <button onClick={() => setUserData({...userData, gender: 'male'})} className={`flex-1 py-3 rounded-xl font-medium transition-all lowercase ${userData.gender === 'male' ? 'bg-gray-800 text-white shadow-md' : 'bg-white/50 text-gray-600'}`}>мужской</button>
                  <button onClick={() => setUserData({...userData, gender: 'female'})} className={`flex-1 py-3 rounded-xl font-medium transition-all lowercase ${userData.gender === 'female' ? 'bg-gray-800 text-white shadow-md' : 'bg-white/50 text-gray-600'}`}>женский</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600 lowercase">возраст</label>
                <input type="number" value={userData.age} onChange={(e) => setUserData({...userData, age: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/50 text-gray-800 outline-none transition-all focus:bg-white focus:shadow-md" placeholder="25" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600 lowercase">рост (см)</label>
                <input type="number" value={userData.height} onChange={(e) => setUserData({...userData, height: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/50 text-gray-800 outline-none transition-all focus:bg-white focus:shadow-md" placeholder="175" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600 lowercase">вес (кг)</label>
                <input type="number" value={userData.weight} onChange={(e) => setUserData({...userData, weight: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/50 text-gray-800 outline-none transition-all focus:bg-white focus:shadow-md" placeholder="70" />
              </div>
            </div>
            <button onClick={saveUserData} disabled={!userData.gender || !userData.age || !userData.height || !userData.weight} className="w-full mt-8 bg-gray-800 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all shadow-lg lowercase">сохранить</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'main') {
    const currentStatus = getStatus(workoutHistory);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-300 via-green-200 to-emerald-100 p-6 font-sans">
        <div className="max-w-md mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-5xl font-black text-gray-800 mb-0.5 leading-none" style={{ fontFamily: 'Arial Black, sans-serif', fontStyle: 'italic', letterSpacing: '-2px', transform: 'scaleY(0.85) skewX(-8deg)', transformOrigin: 'left', fontWeight: 900 }}>vesá</h1>
              <p className="text-gray-700 lowercase ml-1">как дела в качалке??</p>
              <p className="text-gray-600 text-sm lowercase ml-1 mt-1">{todayString}</p>
            </div>
            <button 
              onClick={() => setScreen('profile')}
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all hover:scale-105 flex-shrink-0"
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                background: 'rgba(216, 180, 254, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 32px 0 rgba(168, 85, 247, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
              }}
            >
              {userData.avatar || '🐸'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 shadow-md">
              <div className="text-4xl font-black text-gray-800 mb-1">{workoutHistory.length}</div>
              <div className="text-gray-600 text-sm lowercase">тренировок</div>
            </div>
            <div className="bg-gradient-to-br from-lime-400 to-green-400 rounded-2xl p-5 shadow-md">
              <div className="text-sm text-gray-700 mb-1 lowercase">сегодня ты..</div>
              <div className="text-lg font-black text-gray-800 leading-tight lowercase">{currentStatus}</div>
            </div>
          </div>
          <div className="space-y-3 mb-6">
            <button onClick={() => { setEditingWorkout(null); setCurrentWorkout({ name: '', exercises: [], duration: 60, notes: '', date: new Date() }); setExerciseContext('workout'); setScreen('workout'); }} className="w-full bg-gray-800 text-white p-5 rounded-2xl flex items-center justify-between hover:bg-gray-700 transition-all group shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2.5 rounded-xl"><Plus className="w-5 h-5" /></div>
                <span className="text-lg font-bold lowercase">новая тренировка</span>
              </div>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => setScreen('history')} className="w-full bg-white/60 backdrop-blur-xl p-5 rounded-2xl flex items-center justify-between hover:bg-white/80 transition-all group shadow-md">
              <div className="flex items-center gap-4">
                <div className="bg-gray-800 p-2.5 rounded-xl"><Calendar className="w-5 h-5 text-white" /></div>
                <span className="text-lg font-bold text-gray-800 lowercase">история</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-800 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 lowercase">мои сеты</h3>
              <button onClick={openCreateSetModal} className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-700 transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {workoutSets.length === 0 ? (
              <p className="text-gray-500 text-sm lowercase">пока нет сохраненных сетов</p>
            ) : (
              <div className="space-y-2">
                {workoutSets.map(set => (
                  <div key={set.id} className="flex items-center justify-between bg-white/50 p-3 rounded-xl">
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 lowercase text-sm">{set.name}</div>
                      <div className="text-xs text-gray-600 lowercase">{set.exercises.length} упражнений</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setConfirmDelete({ type: 'set', id: set.id })}
                        className="bg-red-100 p-1.5 rounded-lg hover:bg-red-200 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </button>
                      <button onClick={() => { setEditingWorkout(null); setCurrentWorkout({ name: set.name, exercises: set.exercises.map(ex => ({...ex, id: Date.now() + Math.random()})), duration: 60, notes: '', date: new Date() }); setExerciseContext('workout'); setScreen('workout'); }} className="bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-all font-medium text-sm lowercase">
                        начать
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {confirmDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 lowercase">
                {confirmDelete.type === 'set' ? 'удалить сет?' : 'удалить тренировку?'}
              </h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    if (confirmDelete.type === 'set') {
                      handleDeleteSet(confirmDelete.id);
                    } else {
                      handleDeleteWorkout(confirmDelete.id);
                    }
                  }}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-all lowercase"
                >
                  удалить
                </button>
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all lowercase"
                >
                  отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {showCreateSetModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-6" style={{ pointerEvents: 'auto' }}>
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
              <div className="flex-shrink-0 p-6 border-b">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-gray-800 lowercase">создать сет</h3>
                  <button onClick={() => { setShowCreateSetModal(false); setNewSetName(''); setNewSetExercises([]); }} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <input type="text" value={newSetName} onChange={(e) => setNewSetName(e.target.value)} placeholder="название сета" className="w-full text-lg font-bold bg-gray-50 p-3.5 rounded-xl outline-none text-gray-800 placeholder-gray-400 lowercase" />
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('КЛИК ПО КНОПКЕ ДОБАВИТЬ УПРАЖНЕНИЕ');
                    setExerciseContext('newset');
                    setShowExerciseModal(true);
                  }} 
                  className="w-full bg-gray-800 text-white p-3.5 rounded-xl font-bold mb-4 hover:bg-gray-700 transition-all shadow-md lowercase text-sm" 
                >
                  + добавить упражнение
                </button>
                {newSetExercises.length > 0 && (
                  <div className="space-y-2">
                    {newSetExercises.map(ex => (
                      <div key={ex.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                        <span className="font-medium text-gray-800 lowercase text-sm">{ex.name}</span>
                        <button onClick={() => removeNewSetExercise(ex.id)} className="text-red-500 p-1 hover:bg-red-50 rounded transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 p-6 border-t">
                <button onClick={saveNewSet} disabled={!newSetName.trim() || newSetExercises.length === 0} className="w-full bg-gray-800 text-white p-3.5 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all shadow-md lowercase text-sm">сохранить сет</button>
              </div>
            </div>
          </div>
        )}

        {showExerciseModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[80]">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md flex flex-col shadow-2xl" style={{ maxHeight: '85vh' }}>
              <div className="flex-shrink-0 bg-gradient-to-r from-lime-300 to-green-300 p-5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 lowercase">выбери упражнение</h3>
                <button onClick={() => setShowExerciseModal(false)} className="p-2 hover:bg-white/30 rounded-lg transition-all">
                  <X className="w-5 h-5 text-gray-800" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5" style={{ overflowY: 'scroll', WebkitOverflowScrolling: 'touch' }}>
                {Object.entries(ExerciseDB).map(([category, exercises]) => (
                  <div key={category} className="mb-5">
                    <h4 className="font-bold text-base mb-2 text-gray-800 lowercase">{category}</h4>
                    <div className="space-y-1.5">
                      {exercises.map(exercise => (
                        <button 
                          key={exercise} 
                          onClick={() => {
                            console.log('Клик по упражнению:', exercise, 'Контекст:', exerciseContext);
                            if (exerciseContext === 'newset') {
                              addExerciseToNewSet(exercise);
                            } else {
                              addExerciseToWorkout(exercise);
                            }
                          }} 
                          className="w-full text-left bg-white/60 backdrop-blur-sm p-3 rounded-xl hover:bg-lime-200 hover:shadow-lg transition-all font-medium text-gray-800 text-sm lowercase"
                        >
                          {exercise}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (screen === 'workout') {
    const calories = calcCalories(currentWorkout.exercises);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-300 via-violet-200 to-fuchsia-100 p-6 font-sans">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { setEditingWorkout(null); setScreen('main'); }} className="bg-white/60 backdrop-blur-xl p-2.5 rounded-xl hover:bg-white/80 transition-all shadow-md">
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 lowercase">тренировка</h1>
            <button onClick={saveWorkout} disabled={currentWorkout.exercises.length === 0} className="bg-white/60 backdrop-blur-xl p-2.5 rounded-xl hover:bg-white/80 transition-all disabled:opacity-50 shadow-md">
              <Check className="w-5 h-5 text-gray-800" />
            </button>
          </div>
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 mb-4 shadow-md">
            <input type="text" value={currentWorkout.name} onChange={(e) => setCurrentWorkout({...currentWorkout, name: e.target.value})} placeholder="название тренировки" className="w-full text-xl font-bold bg-transparent outline-none mb-4 text-gray-800 placeholder-gray-400 lowercase" />
            <div className="mb-4">
              <label className="text-xs text-gray-600 block mb-2 lowercase">дата тренировки</label>
              <input type="date" value={currentWorkout.date.toISOString().split('T')[0]} onChange={(e) => setCurrentWorkout({...currentWorkout, date: new Date(e.target.value)})} className="w-full bg-white/50 p-3 rounded-xl outline-none text-gray-800" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-4 rounded-xl shadow-md">
                <div className="flex items-center gap-2 text-white/70 text-xs mb-1 lowercase"><Clock className="w-3.5 h-3.5" /><span>длительность</span></div>
                <input type="number" value={currentWorkout.duration} onChange={(e) => setCurrentWorkout({...currentWorkout, duration: parseInt(e.target.value)})} className="text-2xl font-bold bg-transparent outline-none w-full text-white" />
                <span className="text-xs text-white/70 lowercase">минут</span>
              </div>
              <div className="bg-gradient-to-br from-amber-300 to-orange-300 p-4 rounded-xl shadow-md">
                <div className="flex items-center gap-2 text-xs mb-1 text-gray-700 lowercase"><Flame className="w-3.5 h-3.5" /><span>калории</span></div>
                <div className="text-2xl font-bold text-gray-800">~{calories}</div>
                <span className="text-xs text-gray-700 lowercase">ккал</span>
              </div>
            </div>
            <textarea value={currentWorkout.notes} onChange={(e) => setCurrentWorkout({...currentWorkout, notes: e.target.value})} placeholder="комментарии к тренировке..." className="w-full bg-white/50 p-3 rounded-xl outline-none text-gray-800 placeholder-gray-400 resize-none lowercase text-sm" rows="2" />
          </div>
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 mb-4 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 lowercase">упражнения</h3>
              <button onClick={() => { setExerciseContext('workout'); setShowExerciseModal(true); }} className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-700 transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {currentWorkout.exercises.length === 0 ? (
              <p className="text-gray-500 text-center py-6 lowercase text-sm">добавьте упражнения</p>
            ) : (
              <div className="space-y-3">
                {currentWorkout.exercises.map((exercise) => (
                  <div key={exercise.id} className="bg-white/50 rounded-xl p-3.5 hover:bg-white hover:shadow-md transition-all cursor-default">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-gray-800 flex-1 lowercase text-sm">{exercise.name}</div>
                      <button onClick={() => removeExercise(exercise.id)} className="text-red-500 p-1 hover:bg-red-50 rounded transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1 lowercase">вес (кг)</label>
                        <input type="number" value={exercise.weight} onChange={(e) => updateExercise(exercise.id, 'weight', parseFloat(e.target.value) || 0)} className="w-full bg-white px-2.5 py-2 rounded-lg outline-none font-bold text-gray-800 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1 lowercase">подходы</label>
                        <input type="number" value={exercise.sets} onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 0)} className="w-full bg-white px-2.5 py-2 rounded-lg outline-none font-bold text-gray-800 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1 lowercase">повторы</label>
                        <input type="number" value={exercise.reps} onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value) || 0)} className="w-full bg-white px-2.5 py-2 rounded-lg outline-none font-bold text-gray-800 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-2 lowercase">сложность</label>
                      <div className="flex gap-2">
                        {['easy', 'medium', 'hard'].map(diff => (
                          <button key={diff} onClick={() => updateExercise(exercise.id, 'difficulty', diff)} className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm ${exercise.difficulty === diff ? `${DiffColors[diff].bg} text-white shadow-md` : 'bg-white text-gray-600'}`}>
                            {DiffColors[diff].emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {currentWorkout.exercises.length > 0 && (
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 mb-4 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 lowercase mb-3">мои сеты</h3>
              <div className="flex gap-2">
                <input type="text" value={newSetName} onChange={(e) => setNewSetName(e.target.value)} placeholder="название сета" className="flex-1 bg-white px-4 py-3 rounded-xl outline-none text-gray-800 placeholder-gray-400 lowercase font-medium" />
                <button onClick={saveCurrentWorkoutAsSet} disabled={!newSetName.trim()} className="bg-lime-400 text-gray-800 px-4 py-3 rounded-xl font-bold hover:bg-lime-300 transition-all disabled:opacity-50 flex items-center gap-2">
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <button onClick={saveWorkout} disabled={currentWorkout.exercises.length === 0} className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all shadow-lg lowercase">
            {editingWorkout ? 'сохранить изменения' : 'сохранить тренировку'}
          </button>
        </div>

        {showExerciseModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[80]">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md flex flex-col shadow-2xl" style={{ maxHeight: '85vh' }}>
              <div className="flex-shrink-0 bg-gradient-to-r from-lime-300 to-green-300 p-5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 lowercase">выбери упражнение</h3>
                <button onClick={() => setShowExerciseModal(false)} className="p-2 hover:bg-white/30 rounded-lg transition-all">
                  <X className="w-5 h-5 text-gray-800" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5" style={{ overflowY: 'scroll', WebkitOverflowScrolling: 'touch' }}>
                {Object.entries(ExerciseDB).map(([category, exercises]) => (
                  <div key={category} className="mb-5">
                    <h4 className="font-bold text-base mb-2 text-gray-800 lowercase">{category}</h4>
                    <div className="space-y-1.5">
                      {exercises.map(exercise => (
                        <button 
                          key={exercise} 
                          onClick={() => {
                            console.log('Клик по упражнению:', exercise, 'Контекст:', exerciseContext);
                            if (exerciseContext === 'newset') {
                              addExerciseToNewSet(exercise);
                            } else {
                              addExerciseToWorkout(exercise);
                            }
                          }} 
                          className="w-full text-left bg-white/60 backdrop-blur-sm p-3 rounded-xl hover:bg-lime-200 hover:shadow-lg transition-all font-medium text-gray-800 text-sm lowercase"
                        >
                          {exercise}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (screen === 'history') {
    const months = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
    const avgCalories = workoutHistory.length > 0 ? Math.round(workoutHistory.reduce((sum, w) => sum + w.calories, 0) / workoutHistory.length) : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-300 via-violet-200 to-fuchsia-100 p-6 font-sans">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setScreen('main')} className="bg-white/60 backdrop-blur-xl p-2.5 rounded-xl hover:bg-white/80 transition-all shadow-md">
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 lowercase">история</h1>
            <div className="w-10" />
          </div>
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 mb-4 shadow-md">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))} className="p-2 hover:bg-white/50 rounded-lg transition-all">
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>
              <h2 className="text-lg font-bold text-gray-800 lowercase">{months[selectedDate.getMonth()]} {selectedDate.getFullYear()}</h2>
              <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))} className="p-2 hover:bg-white/50 rounded-lg transition-all">
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'].map(day => (
                <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">{renderCal()}</div>
            <div className="flex items-center justify-center gap-3 mt-5 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-green-400 rounded shadow-sm"></div>
                <span className="text-gray-600 lowercase">легко</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-amber-400 rounded shadow-sm"></div>
                <span className="text-gray-600 lowercase">средне</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-red-400 rounded shadow-sm"></div>
                <span className="text-gray-600 lowercase">тяжело</span>
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-gray-800 lowercase">статистика</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-purple-300 to-pink-300 rounded-xl shadow-sm">
                <span className="text-gray-800 lowercase text-sm">всего тренировок</span>
                <span className="font-black text-2xl text-gray-800">{workoutHistory.length}</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-300 to-orange-300 rounded-xl shadow-sm">
                <span className="text-gray-800 lowercase text-sm">~в среднем за треньку</span>
                <span className="font-black text-2xl text-gray-800">{avgCalories}</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-xl shadow-sm">
                <span className="text-gray-800 lowercase text-sm">среднее время</span>
                <span className="font-black text-2xl text-gray-800">{workoutHistory.length > 0 ? Math.round(workoutHistory.reduce((sum, w) => sum + w.duration, 0) / workoutHistory.length) : 0} мин</span>
              </div>
            </div>
          </div>
        </div>

        {viewingWorkouts.length > 0 && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md flex flex-col shadow-2xl" style={{ maxHeight: '85vh' }}>
              <div className="flex-shrink-0 bg-gradient-to-r from-lime-300 to-green-300 p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 lowercase">тренировки</h3>
                  <p className="text-sm text-gray-700 lowercase">{new Date(viewingWorkouts[0].date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <button onClick={() => setViewingWorkouts([])} className="p-2 hover:bg-white/30 rounded-lg transition-all">
                  <X className="w-5 h-5 text-gray-800" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {viewingWorkouts.map((workout) => (
                  <div key={workout.id} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-800 lowercase text-lg">{workout.name || 'тренировка'}</h4>
                      <div className="flex gap-2">
                        <button onClick={() => editWorkout(workout)} className="bg-white p-1.5 rounded-lg hover:bg-gray-100 transition-all shadow-sm">
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => setConfirmDelete({ type: 'workout', id: workout.id })}
                          className="bg-red-100 p-1.5 rounded-lg hover:bg-red-200 transition-all shadow-sm cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-3 rounded-xl shadow-sm">
                        <div className="text-white/70 text-xs mb-0.5 lowercase">длительность</div>
                        <div className="text-white font-bold text-lg">{workout.duration} мин</div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-300 to-orange-300 p-3 rounded-xl shadow-sm">
                        <div className="text-gray-700 text-xs mb-0.5 lowercase">калории</div>
                        <div className="text-gray-800 font-bold text-lg">~{workout.calories}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-bold text-sm text-gray-700 lowercase">упражнения:</h5>
                      {workout.exercises.map((exercise, idx) => (
                        <div key={idx} className="bg-white/60 rounded-lg p-2.5 text-sm">
                          <div className="font-bold text-gray-800 mb-1 lowercase">{exercise.name}</div>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span>{exercise.weight} кг</span>
                            <span>{exercise.sets} × {exercise.reps}</span>
                            <span className={`px-2 py-0.5 rounded ${DiffColors[exercise.difficulty].bg} text-white font-medium`}>{DiffColors[exercise.difficulty].emoji}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {workout.notes && (
                      <div className="mt-3">
                        <h5 className="font-bold text-sm text-gray-700 lowercase mb-1.5">комментарии:</h5>
                        <div className="bg-white/60 p-2.5 rounded-lg text-gray-800 lowercase text-sm">{workout.notes}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {confirmDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 lowercase">
                {confirmDelete.type === 'set' ? 'удалить сет?' : 'удалить тренировку?'}
              </h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    if (confirmDelete.type === 'set') {
                      handleDeleteSet(confirmDelete.id);
                    } else {
                      handleDeleteWorkout(confirmDelete.id);
                    }
                  }}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-all lowercase"
                >
                  удалить
                </button>
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all lowercase"
                >
                  отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
