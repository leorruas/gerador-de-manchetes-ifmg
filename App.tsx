import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FormatId, FormatConfig, ImageTransform, ExportType } from './types';
import { FORMATS, IFMGLogo, IFMGCircleLogo } from './constants';
import { generateAndDownloadImage } from './services/canvasExport';

// --- Helper Components ---

const Step: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <li className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mt-1 text-amber-400">{icon}</div>
        <div>
            <p className="font-bold text-white">{title}</p>
            <p className="text-zinc-400">{children}</p>
        </div>
    </li>
);

const WelcomeScreen: React.FC<{
    onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
}> = ({ onImageSelect, onFileDrop }) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
    };
    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDraggingOver(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDraggingOver(false);
    };
    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDraggingOver(false);
        onFileDrop(e);
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-8">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
                <div className="flex flex-col items-center text-center">
                    <IFMGLogo className="h-8 text-white mb-6 mx-auto" />
                    <h1 className="text-5xl font-bold mb-8">MancheteExpress</h1>

                    <label
                        htmlFor="image-upload"
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`w-full p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                            isDraggingOver
                                ? 'border-solid border-amber-400 bg-zinc-900 scale-105'
                                : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-4 font-semibold text-white">Arraste e solte uma imagem aqui</p>
                        <p className="text-sm text-zinc-400">ou clique para selecionar</p>
                        <input id="image-upload" type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={onImageSelect} />
                    </label>
                </div>
                
                <div className="w-full">
                    <h2 className="text-2xl font-bold mb-6 text-center lg:text-left">Como usar:</h2>
                     <ol className="space-y-4">
                       <Step 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                            title="1. Envie uma imagem"
                        >
                            Arraste um arquivo para a área indicada ou clique para escolher (JPG, PNG, WebP).
                        </Step>
                         <Step 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10V4a1 1 0 011-1h6m21 14v6a1 1 0 01-1 1h-6m-2-21v.01M12 21v-.01M3 14h.01M21 10h-.01M3 21h18" /></svg>}
                            title="2. Reenquadre a imagem"
                        >
                            Use o ícone de alvo em cada preview para abrir o editor, onde você pode ajustar o zoom e a posição da imagem.
                        </Step>
                        <Step 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>}
                            title="3. Edite a manchete"
                        >
                            Clique no texto padrão sobre a imagem para escrever a manchete desejada para os formatos de Instagram.
                        </Step>
                        <Step 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>}
                            title="4. Ajuste a posição do texto"
                        >
                            Clique e arraste a caixa de texto verticalmente para encontrar a melhor posição em cada formato.
                        </Step>
                         <Step 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                            title="5. Exporte tudo"
                        >
                            Clique em "Exportar Todos", defina um nome de arquivo (slug) e escolha o formato para baixar todas as artes.
                        </Step>
                    </ol>
                </div>
            </div>
        </div>
    );
};

const ImagePreview: React.FC<{
    format: FormatConfig;
    baseImage: string;
    transform: ImageTransform;
    headline: string;
    onHeadlineChange: (newHeadline: string) => void;
    textVerticalPosition: number;
    onTextVerticalPositionChange: (newPosition: number) => void;
    onCropClick: () => void;
}> = ({ format, baseImage, transform, headline, onHeadlineChange, textVerticalPosition, onTextVerticalPositionChange, onCropClick }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(headline);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const headlineBoxRef = useRef<HTMLDivElement>(null);

    const [isDragging, setIsDragging] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef({ y: 0, initialTop: 0 });
    const [previewWidth, setPreviewWidth] = useState(0);

    useEffect(() => {
        if (previewRef.current) {
            const currentRef = previewRef.current;
            const resizeObserver = new ResizeObserver(entries => {
                if (entries[0]) {
                    setPreviewWidth(entries[0].contentRect.width);
                }
            });
            resizeObserver.observe(currentRef);
            
            return () => {
                resizeObserver.unobserve(currentRef);
            };
        }
        return () => {};
    }, []);

    useEffect(() => {
        if (isEditing && textAreaRef.current) {
            textAreaRef.current.focus();
            textAreaRef.current.select();
        }
    }, [isEditing]);

    const handleHeadlineBlur = () => {
        setIsEditing(false);
        onHeadlineChange(editText);
    };
    
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!format.hasText || isEditing || !headlineBoxRef.current) return;
        setIsDragging(true);
        dragStartRef.current = {
            y: e.clientY,
            initialTop: headlineBoxRef.current.offsetTop,
        };
        e.currentTarget.style.cursor = 'grabbing';
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !previewRef.current || !headlineBoxRef.current) return;
        
        const previewRect = previewRef.current.getBoundingClientRect();
        const boxHeight = headlineBoxRef.current.offsetHeight;
        
        const deltaY = e.clientY - dragStartRef.current.y;
        let newTop = dragStartRef.current.initialTop + deltaY;

        const maxTop = previewRect.height - boxHeight;
        newTop = Math.max(0, Math.min(newTop, maxTop));
        
        const newPercentage = maxTop > 0 ? newTop / maxTop : 0;
        onTextVerticalPositionChange(newPercentage);
    }, [isDragging, onTextVerticalPositionChange]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        if(headlineBoxRef.current) {
          headlineBoxRef.current.style.cursor = 'grab';
        }
    }, []);
    
    const previewHeight = previewRef.current?.offsetHeight ?? 0;
    const boxHeight = headlineBoxRef.current?.offsetHeight ?? 0;
    const maxTop = previewHeight - boxHeight;
    const topPosition = maxTop > 0 ? textVerticalPosition * maxTop : 0;

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);
    
    useEffect(() => {
        if (isEditing && textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [isEditing, editText]);
    
    const scaleFactor = previewWidth > 0 ? previewWidth / format.width : 0;

    return (
        <div className="mb-8 last:mb-0">
            <h3 className="text-lg font-bold text-zinc-400 mb-2">{format.name} ({format.width}x{format.height})</h3>
            <div
                ref={previewRef}
                className="relative bg-black rounded-lg overflow-hidden shadow-lg w-full"
                style={{ aspectRatio: `${format.width} / ${format.height}` }}
            >
                <img 
                  src={baseImage} 
                  alt="Preview" 
                  className="absolute top-0 left-0 w-full h-full object-cover" 
                  style={{
                      transform: `scale(${transform.zoom}) translate(${transform.position.x}px, ${transform.position.y}px)`,
                  }}
                />

                {format.hasText && (
                    <div
                        ref={headlineBoxRef}
                        className="absolute w-[87.59%] left-[6.2%]"
                        style={{ 
                            top: `${topPosition}px`,
                        }}
                        onMouseDown={handleMouseDown}
                    >
                         <div 
                            className="bg-black/50 backdrop-blur-sm rounded-2xl cursor-grab flex items-center"
                            style={{ padding: `${scaleFactor * 60}px`}}
                         >
                            {format.hasLogo && (
                                <IFMGCircleLogo
                                    className="flex-shrink-0"
                                    style={{
                                        width: `${scaleFactor * 100}px`,
                                        height: `${scaleFactor * 100}px`,
                                        marginRight: `${scaleFactor * 20}px`
                                    }}
                                />
                            )}
                            <div className="flex-grow">
                                {isEditing ? (
                                    <textarea
                                        ref={textAreaRef}
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        onBlur={handleHeadlineBlur}
                                        className="w-full bg-transparent text-white font-bold resize-none border-none outline-none focus:ring-0 p-0"
                                        style={{
                                            fontSize: `${scaleFactor * 50}px`,
                                            lineHeight: `${scaleFactor * 60}px`,
                                        }}
                                    />
                                ) : (
                                    <div 
                                        className="text-white font-bold" 
                                        onClick={() => setIsEditing(true)}
                                        style={{
                                            fontSize: `${scaleFactor * 50}px`,
                                            lineHeight: `${scaleFactor * 60}px`,
                                        }}
                                    >
                                        {headline || ' '}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                 <button onClick={onCropClick} className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/75 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10V4a1 1 0 011-1h6m21 14v6a1 1 0 01-1 1h-6M3 14h.01M21 10h-.01M12 3v.01M12 21v-.01M3 21h18" /></svg>
                 </button>
            </div>
        </div>
    );
};

const ControlsBar: React.FC<{
    onExport: () => void;
    onNewImage: () => void;
}> = ({ onExport, onNewImage }) => (
    <footer className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-zinc-800 p-4 flex justify-center items-center gap-4 z-10">
        <button onClick={onNewImage} className="bg-zinc-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-zinc-700 transition-colors">
            Nova Imagem
        </button>
        <button onClick={onExport} className="bg-amber-400 text-black font-bold py-2 px-6 rounded-lg hover:bg-amber-500 transition-colors">
            Exportar Todos
        </button>
    </footer>
);

const ExportModal: React.FC<{
    slug: string;
    onSlugChange: (newSlug: string) => void;
    onClose: () => void;
    onConfirm: (type: ExportType) => void;
}> = ({ slug, onSlugChange, onClose, onConfirm }) => (
     <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
        <div className="bg-black border border-zinc-800 rounded-xl p-8 shadow-lg w-full max-w-sm text-center">
            <h2 className="text-2xl font-bold mb-4">Exportar Imagens</h2>
             <div className="w-full mb-6">
                <label htmlFor="slug" className="block text-sm font-medium text-zinc-400 mb-2 text-left">Nome do arquivo (slug)</label>
                <input
                    type="text"
                    id="slug"
                    value={slug}
                    onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-'))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="ex: semana-de-calouros"
                />
            </div>
            <p className="text-zinc-400 mb-6">Escolha o formato de exportação:</p>
            <div className="flex gap-4">
                <button onClick={() => onConfirm('png')} className="flex-1 bg-amber-400 text-black font-bold py-3 rounded-lg hover:bg-amber-500 transition-colors">PNG</button>
                <button onClick={() => onConfirm('jpeg')} className="flex-1 bg-amber-400 text-black font-bold py-3 rounded-lg hover:bg-amber-500 transition-colors">JPG</button>
            </div>
             <button onClick={onClose} className="mt-6 text-red-500 hover:text-red-400 transition-colors">Cancelar</button>
        </div>
    </div>
);

const CropModal: React.FC<{
    format: FormatConfig;
    baseImage: string;
    initialTransform: ImageTransform;
    onClose: () => void;
    onSave: (newTransform: ImageTransform) => void;
}> = ({ format, baseImage, initialTransform, onClose, onSave }) => {
    const [transform, setTransform] = useState(initialTransform);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, initialPosition: { x: 0, y: 0 } });
    const imageContainerRef = useRef<HTMLDivElement>(null);

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTransform(t => ({ ...t, zoom: parseFloat(e.target.value) }));
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            initialPosition: transform.position,
        };
        e.currentTarget.style.cursor = 'grabbing';
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !imageContainerRef.current) return;
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        
        setTransform(t => {
            const newPos = {
                x: dragStartRef.current.initialPosition.x + deltaX,
                y: dragStartRef.current.initialPosition.y + deltaY
            };
            return { ...t, position: newPos };
        });

    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        if (imageContainerRef.current) {
            imageContainerRef.current.style.cursor = 'grab';
        }
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
            <div className="bg-black border border-zinc-800 rounded-xl shadow-lg w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-zinc-800 flex-shrink-0">
                    <h2 className="text-xl font-bold text-center">Reenquadrar: {format.name}</h2>
                </div>
                <div className="p-6 flex-1 flex items-center justify-center min-h-0">
                    <div 
                        className="relative w-full"
                        style={{ aspectRatio: `${format.width} / ${format.height}` }}
                    >
                         <div 
                            ref={imageContainerRef}
                            className="absolute inset-0 w-full h-full overflow-hidden bg-black rounded-lg cursor-grab"
                            onMouseDown={handleMouseDown}
                        >
                            <img 
                                src={baseImage} 
                                alt="Crop preview" 
                                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                                style={{
                                   transform: `scale(${transform.zoom}) translate(${transform.position.x}px, ${transform.position.y}px)`,
                                   transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                                }}
                            />
                        </div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-xs bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center gap-2 z-10">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
                             <input 
                                type="range"
                                id="zoom"
                                min="1"
                                max="3"
                                step="0.01"
                                value={transform.zoom}
                                onChange={handleZoomChange}
                                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3h-6" /></svg>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-zinc-800 flex gap-4 flex-shrink-0">
                    <button onClick={onClose} className="flex-1 bg-zinc-700 text-white font-semibold py-2 rounded-lg hover:bg-zinc-600 transition-colors">Cancelar</button>
                    <button onClick={() => onSave(transform)} className="flex-1 bg-amber-400 text-black font-bold py-2 rounded-lg hover:bg-amber-500 transition-colors">Salvar</button>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [baseImage, setBaseImage] = useState<string | null>(null);
    const [headline, setHeadline] = useState<string>("Título da notícia ou chamada para a arte");
    const [slug, setSlug] = useState<string>("noticia-exemplo");
    const [textVerticalPositions, setTextVerticalPositions] = useState<Record<FormatId, number>>({
        [FormatId.INSTA_POST]: 0.5,
        [FormatId.INSTA_STORY]: 0.5,
        [FormatId.PORTAL_CAMPI]: 0.5,
        [FormatId.PORTAL_PRINCIPAL]: 0.5,
    });
    const [transforms, setTransforms] = useState<Record<FormatId, ImageTransform>>(
        Object.values(FormatId).reduce((acc, curr) => ({
            ...acc,
            [curr]: { zoom: 1, position: { x: 0, y: 0 } }
        }), {} as Record<FormatId, ImageTransform>)
    );

    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [croppingFormatId, setCroppingFormatId] = useState<FormatId | null>(null);
    
    const [showExportModal, setShowExportModal] = useState(false);
    const imageRef = useRef<HTMLImageElement>(new Image());

    const processAndSetImage = (file: File | undefined) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setBaseImage(result);
                imageRef.current.src = result;
            };
            reader.readAsDataURL(file);
        } else if (file) {
            alert("Por favor, envie um arquivo de imagem válido (JPG, PNG, WebP).");
        }
    };
    
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        processAndSetImage(e.target.files?.[0]);
    };

    const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        processAndSetImage(e.dataTransfer.files?.[0]);
    };

    const handleNewImage = () => {
        setBaseImage(null);
    };

    const handleExport = async (type: ExportType) => {
        if (!baseImage) return;

        for (const format of Object.values(FORMATS)) {
            await generateAndDownloadImage(
                format,
                imageRef.current,
                transforms[format.id],
                headline,
                textVerticalPositions[format.id],
                slug,
                type
            );
        }
        setShowExportModal(false);
    };

    const handleOpenCropModal = (formatId: FormatId) => {
        setCroppingFormatId(formatId);
        setIsCropModalOpen(true);
    };

    const handleSaveCrop = (newTransform: ImageTransform) => {
        if (croppingFormatId) {
            setTransforms(prev => ({ ...prev, [croppingFormatId]: newTransform }));
        }
        setIsCropModalOpen(false);
        setCroppingFormatId(null);
    };

    if (!baseImage) {
        return <WelcomeScreen onImageSelect={handleImageSelect} onFileDrop={handleFileDrop} />;
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            <div className="max-w-2xl mx-auto py-8 px-4">
                 {Object.values(FORMATS).map(format => (
                    <ImagePreview
                        key={format.id}
                        format={format}
                        baseImage={baseImage}
                        transform={transforms[format.id]}
                        headline={headline}
                        onHeadlineChange={setHeadline}
                        textVerticalPosition={textVerticalPositions[format.id]}
                        onTextVerticalPositionChange={(newPos) => setTextVerticalPositions(prev => ({ ...prev, [format.id]: newPos }))}
                        onCropClick={() => handleOpenCropModal(format.id)}
                    />
                ))}
            </div>
            
            <ControlsBar 
                onNewImage={handleNewImage}
                onExport={() => setShowExportModal(true)}
            />

            {showExportModal && (
                <ExportModal 
                    slug={slug}
                    onSlugChange={setSlug}
                    onClose={() => setShowExportModal(false)}
                    onConfirm={handleExport}
                />
            )}
            {isCropModalOpen && croppingFormatId && (
                <CropModal
                    format={FORMATS[croppingFormatId]}
                    baseImage={baseImage}
                    initialTransform={transforms[croppingFormatId]}
                    onClose={() => setIsCropModalOpen(false)}
                    onSave={handleSaveCrop}
                />
            )}
        </div>
    );
};

export default App;
